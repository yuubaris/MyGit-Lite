import os
import re
import stat
import zipfile
from dataclasses import dataclass

from .paths import MAX_PATH_LENGTH, PathError, validate_repo_path


class UploadError(ValueError):
    pass


@dataclass
class UploadedFile:
    path: str
    temp_path: str
    mode: str
    size: int


def _validate_member_name(name: str) -> str:
    if name.endswith("/"):
        name = name.rstrip("/")
    if not name:
        raise UploadError("empty entry name")
    if "\x00" in name:
        raise UploadError("entry name contains NUL")
    if "\\" in name:
        raise UploadError("entry name contains backslash")
    if name.startswith("/"):
        raise UploadError("absolute entry name")
    if re.match(r"^[A-Za-z]:", name):
        raise UploadError("entry name contains drive letter")
    if len(name) > MAX_PATH_LENGTH:
        raise UploadError("entry name is too long")
    try:
        return validate_repo_path(name, allow_empty=False)
    except PathError as exc:
        raise UploadError(str(exc)) from exc


def _member_mode(info: zipfile.ZipInfo) -> int:
    return (info.external_attr >> 16) & 0xFFFF


def _check_member_type(info: zipfile.ZipInfo):
    mode = _member_mode(info)
    if mode == 0 or stat.S_IFMT(mode) == 0:
        # Zips created by Windows or Python often carry only permission bits.
        return
    if stat.S_ISLNK(mode):
        raise UploadError("symbolic links are not supported")
    if stat.S_ISCHR(mode) or stat.S_ISBLK(mode) or stat.S_ISFIFO(mode) or stat.S_ISSOCK(mode):
        raise UploadError("special files are not supported")
    if not (stat.S_ISREG(mode) or stat.S_ISDIR(mode)):
        raise UploadError("unsupported entry type")


def extract_zip(
    stream,
    dest_dir: str,
    max_files: int,
    max_uncompressed_bytes: int,
) -> dict[str, UploadedFile]:
    """Validate and extract a zip into dest_dir. Returns path -> UploadedFile."""
    try:
        archive = zipfile.ZipFile(stream)
    except zipfile.BadZipFile as exc:
        raise UploadError("invalid zip file") from exc

    with archive:
        infos = archive.infolist()
        if len(infos) > max_files:
            raise UploadError("too many entries")

        total_uncompressed = 0
        total_compressed = 0
        entries = []
        seen: dict[str, str] = {}

        for info in infos:
            if info.flag_bits & 0x1:
                raise UploadError("encrypted entries are not supported")
            _check_member_type(info)
            path = _validate_member_name(info.filename)
            if info.is_dir():
                continue
            folded = path.casefold()
            if folded in seen:
                raise UploadError("duplicate or case-colliding path")
            seen[folded] = path
            total_uncompressed += info.file_size
            total_compressed += max(info.compress_size, 1)
            entries.append((info, path))

        if total_uncompressed > max_uncompressed_bytes:
            raise UploadError("uncompressed size exceeds limit")
        if total_compressed and total_uncompressed / total_compressed > 100:
            raise UploadError("compression ratio exceeds limit")

        folded_paths = set(seen)
        for folded in folded_paths:
            parts = folded.split("/")
            for index in range(1, len(parts)):
                if "/".join(parts[:index]) in folded_paths:
                    raise UploadError("file and directory path conflict")

        os.makedirs(dest_dir, mode=0o700, exist_ok=True)
        result: dict[str, UploadedFile] = {}
        written_total = 0

        for info, path in entries:
            target = os.path.join(dest_dir, *path.split("/"))
            if os.path.commonpath([os.path.abspath(dest_dir), os.path.abspath(target)]) != os.path.abspath(dest_dir):
                raise UploadError("entry escapes extraction directory")
            os.makedirs(os.path.dirname(target), mode=0o700, exist_ok=True)
            written = 0
            try:
                source = archive.open(info)
            except (RuntimeError, zipfile.BadZipFile) as exc:
                raise UploadError("cannot read zip entry") from exc
            with source, open(target, "wb") as out:
                while True:
                    chunk = source.read(1024 * 1024)
                    if not chunk:
                        break
                    written += len(chunk)
                    written_total += len(chunk)
                    if written_total > max_uncompressed_bytes:
                        raise UploadError("uncompressed size exceeds limit")
                    out.write(chunk)
            mode_bits = _member_mode(info)
            mode = "100755" if (mode_bits & 0o111) else "100644"
            result[path] = UploadedFile(
                path=path, temp_path=target, mode=mode, size=written
            )

    return result

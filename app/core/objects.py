import hashlib
import json
import os
import struct
import tempfile
import zlib

MAGIC = b"MGL1"
TYPE_BLOB = 1
TYPE_TREE = 2
TYPE_COMMIT = 3
TYPE_TO_NAME = {TYPE_BLOB: "blob", TYPE_TREE: "tree", TYPE_COMMIT: "commit"}
NAME_TO_TYPE = {name: num for num, name in TYPE_TO_NAME.items()}

HEADER_SIZE = 13


class ObjectError(Exception):
    pass


class ObjectNotFound(ObjectError):
    pass


class ObjectFormatError(ObjectError):
    pass


def canonical_json(obj) -> bytes:
    return json.dumps(
        obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def object_id(type_name: str, content: bytes) -> str:
    header = f"{type_name} {len(content)}\0".encode("utf-8")
    return hashlib.sha256(header + content).hexdigest()


def object_path(repo_dir: str, oid: str) -> str:
    return os.path.join(repo_dir, "objects", oid[:2], oid)


def _atomic_write(dest: str, data: bytes):
    directory = os.path.dirname(dest)
    os.makedirs(directory, mode=0o700, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=directory, prefix=".tmp-")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.chmod(tmp, 0o600)
        os.replace(tmp, dest)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def write_object(repo_dir: str, type_name: str, content: bytes) -> str:
    type_num = NAME_TO_TYPE[type_name]
    oid = object_id(type_name, content)
    dest = object_path(repo_dir, oid)
    if os.path.exists(dest):
        return oid
    data = MAGIC + bytes([type_num]) + struct.pack(">Q", len(content))
    data += zlib.compress(content)
    _atomic_write(dest, data)
    return oid


def write_blob_from_path(repo_dir: str, src_path: str) -> str:
    """Stream a file into the object store without loading it into memory."""
    size = os.path.getsize(src_path)
    obj_root = os.path.join(repo_dir, "objects")
    os.makedirs(obj_root, mode=0o700, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=obj_root, prefix=".tmp-")
    hasher = hashlib.sha256()
    hasher.update(f"blob {size}\0".encode("utf-8"))
    try:
        with os.fdopen(fd, "wb") as out:
            out.write(MAGIC + bytes([TYPE_BLOB]) + struct.pack(">Q", size))
            compressor = zlib.compressobj()
            with open(src_path, "rb") as src:
                while True:
                    chunk = src.read(1024 * 1024)
                    if not chunk:
                        break
                    hasher.update(chunk)
                    out.write(compressor.compress(chunk))
            out.write(compressor.flush())
            out.flush()
            os.fsync(out.fileno())
        oid = hasher.hexdigest()
        dest = object_path(repo_dir, oid)
        os.makedirs(os.path.dirname(dest), mode=0o700, exist_ok=True)
        os.chmod(tmp, 0o600)
        if os.path.exists(dest):
            os.unlink(tmp)
        else:
            os.replace(tmp, dest)
        return oid
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def read_object_header(repo_dir: str, oid: str):
    path = object_path(repo_dir, oid)
    if not os.path.exists(path):
        raise ObjectNotFound(oid)
    with open(path, "rb") as f:
        header = f.read(HEADER_SIZE)
    if len(header) != HEADER_SIZE or header[:4] != MAGIC:
        raise ObjectFormatError(f"bad header: {oid}")
    type_name = TYPE_TO_NAME.get(header[4])
    if type_name is None:
        raise ObjectFormatError(f"bad type: {oid}")
    length = struct.unpack(">Q", header[5:])[0]
    return type_name, length


def read_object(repo_dir: str, oid: str):
    path = object_path(repo_dir, oid)
    if not os.path.exists(path):
        raise ObjectNotFound(oid)
    with open(path, "rb") as f:
        header = f.read(HEADER_SIZE)
        if len(header) != HEADER_SIZE or header[:4] != MAGIC:
            raise ObjectFormatError(f"bad header: {oid}")
        type_name = TYPE_TO_NAME.get(header[4])
        if type_name is None:
            raise ObjectFormatError(f"bad type: {oid}")
        length = struct.unpack(">Q", header[5:])[0]
        compressed = f.read()
    try:
        content = zlib.decompress(compressed)
    except zlib.error as exc:
        raise ObjectFormatError(f"bad payload: {oid}") from exc
    if len(content) != length:
        raise ObjectFormatError(f"length mismatch: {oid}")
    return type_name, content


def write_commit(
    repo_dir: str,
    tree: str,
    parent: str | None,
    message: str,
    author: str,
    created_at: str,
) -> str:
    content = canonical_json(
        {
            "tree": tree,
            "parent": parent,
            "message": message,
            "author": author,
            "created_at": created_at,
        }
    )
    return write_object(repo_dir, "commit", content)


def read_commit(repo_dir: str, oid: str) -> dict:
    type_name, content = read_object(repo_dir, oid)
    if type_name != "commit":
        raise ObjectNotFound(oid)
    return json.loads(content.decode("utf-8"))

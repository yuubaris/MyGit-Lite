from pathspec import GitIgnoreSpec

HARD_EXCLUDED_DIRS = {".git"}


class IgnoreMatcher:
    """Evaluate nested .gitignore files using Git semantics.

    Files are keyed by the directory that contains the .gitignore file.
    Rules from deeper files override shallower ones; a file inside an
    excluded directory cannot be re-included by a negation rule.
    """

    def __init__(self, ignore_files: dict[str, bytes]):
        self.specs: dict[str, GitIgnoreSpec] = {}
        for directory, content in ignore_files.items():
            text = content.decode("utf-8-sig", errors="replace")
            self.specs[directory] = GitIgnoreSpec.from_lines(text.splitlines())

    def _ordered_specs(self):
        return sorted(self.specs, key=lambda d: 0 if d == "" else d.count("/") + 1)

    def _check(self, path: str, is_dir: bool) -> bool:
        result = None
        for directory in self._ordered_specs():
            if directory:
                if not path.startswith(directory + "/"):
                    continue
                if is_dir and path == directory:
                    continue
                relative = path[len(directory) + 1:]
            else:
                relative = path
            checked = relative + "/" if is_dir else relative
            outcome = self.specs[directory].check_file(checked)
            if outcome.include is not None:
                result = bool(outcome.include)
        return result is True

    def is_ignored(self, path: str) -> bool:
        parts = path.split("/")
        if any(part in HARD_EXCLUDED_DIRS for part in parts):
            return True
        for index in range(1, len(parts)):
            ancestor = "/".join(parts[:index])
            if self._check(ancestor, is_dir=True):
                return True
        return self._check(path, is_dir=False)

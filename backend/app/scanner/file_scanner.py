import hashlib
import mimetypes
from pathlib import Path


MAX_FILE_SIZE = 25 * 1024 * 1024


def calculate_sha256(file_path: str) -> str:
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as f:
        while chunk := f.read(1024 * 1024):
            sha256.update(chunk)

    return sha256.hexdigest()


def scan_file(file_path: str, original_name: str):

    path = Path(file_path)

    size = path.stat().st_size

    if size > MAX_FILE_SIZE:
        raise ValueError("File exceeds 25 MB limit")

    sha256 = calculate_sha256(file_path)

    mime_type, _ = mimetypes.guess_type(original_name)

    extension = path.suffix.lower() or "none"

    if size == 0:
        risk_score = 5
        severity = "Low"

    elif extension in [
        ".exe", ".dll", ".scr", ".bat", ".cmd",
        ".ps1", ".vbs", ".js", ".jar"
    ]:
        risk_score = 65
        severity = "High"

    elif extension in [
        ".zip", ".rar", ".7z", ".iso"
    ]:
        risk_score = 35
        severity = "Medium"

    else:
        risk_score = 10
        severity = "Low"

    return {
        "filename": original_name,
        "size": size,
        "size_kb": round(size / 1024, 2),
        "extension": extension,
        "mime_type": mime_type or "application/octet-stream",
        "sha256": sha256,
        "risk_score": risk_score,
        "severity": severity,
        "safe_to_execute": False,
        "message": "File analyzed without execution."
    }

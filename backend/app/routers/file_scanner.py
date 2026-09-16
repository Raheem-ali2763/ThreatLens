import os
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.scanner.file_scanner import scan_file


router = APIRouter(
    prefix="/api/scanner",
    tags=["File Scanner"]
)

UPLOAD_DIR = os.path.abspath("uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/file")
async def scan_uploaded_file(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    allowed_extensions = {
        ".exe", ".dll", ".pdf", ".docx", ".doc",
        ".xlsx", ".xls", ".zip", ".rar", ".7z",
        ".txt", ".csv", ".json", ".js", ".py",
        ".ps1", ".bat", ".cmd", ".vbs",
        ".jpg", ".jpeg", ".png"
    }

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}"
        )

    safe_name = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    total = 0

    try:

        with open(file_path, "wb") as buffer:

            while True:

                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total += len(chunk)

                if total > 25 * 1024 * 1024:
                    raise HTTPException(
                        status_code=413,
                        detail="Maximum file size is 25 MB"
                    )

                buffer.write(chunk)

        result = scan_file(
            file_path,
            file.filename
        )

        return {
            "success": True,
            "scanner": "ThreatLens File Scanner",
            "result": result
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File analysis failed: {str(e)}"
        )

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

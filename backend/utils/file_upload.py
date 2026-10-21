import os
import time
from fastapi import UploadFile, HTTPException
import cloudinary
import cloudinary.uploader

if os.getenv("CLOUDINARY_URL"):
    cloudinary.config()
elif os.getenv("CLOUDINARY_CLOUD_NAME"):
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET")
    )

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpeg", ".jpg", ".png", ".webp", ".jfif", ".pdf", ".csv", ".xlsx", ".xls"}
ALLOWED_MIMETYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/jfif",
    "application/pdf", "text/csv", 
    "application/vnd.ms-excel", 
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit

def validate_magic_bytes(content: bytes, ext: str):
    """Validate magic file signatures to prevent executable files disguised with innocent extensions."""
    if ext in [".jpg", ".jpeg", ".jfif"] and not content.startswith(b"\xff\xd8"):
        raise HTTPException(status_code=400, detail="Invalid file: JPEG/JFIF image signature does not match.")
    elif ext == ".png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=400, detail="Invalid file: PNG image signature does not match.")
    elif ext == ".webp" and not (content.startswith(b"RIFF") and len(content) >= 12 and content[8:12] == b"WEBP"):
        raise HTTPException(status_code=400, detail="Invalid file: WEBP image signature does not match.")
    elif ext == ".pdf" and not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid file: PDF document signature does not match.")

async def save_upload(file: UploadFile, fieldname: str):
    # 1. Sanitize filename and check Extension & MIME Type
    clean_name = os.path.basename(file.filename or "")
    ext = os.path.splitext(clean_name)[1].lower()

    if not ext or ext not in ALLOWED_EXTENSIONS or (file.content_type and file.content_type.lower() not in ALLOWED_MIMETYPES):
        raise HTTPException(status_code=400, detail="Error: Only Images (JPEG, PNG, WEBP), PDFs, CSV, and Excel spreadsheets are allowed!")
        
    # 2. Check size and read content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Error: File is too large. Limit is 10MB.")

    # 3. Validate magic bytes header for binary media
    validate_magic_bytes(content, ext)
        
    # 4. Generate unique filename prefix
    timestamp = int(time.time() * 1000)
    public_id = f"{fieldname}-{timestamp}"
    
    # 5. Upload to Cloudinary cloud bucket directly from memory (with local storage fallback)
    try:
        result = cloudinary.uploader.upload(
            content, 
            public_id=public_id, 
            folder="btech_admission", 
            resource_type="auto"
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"[STORAGE ERROR] Cloudinary Upload Notice: {e}. Saving to local storage.")
        new_filename = f"{public_id}{ext}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        with open(file_path, "wb") as f:
            f.write(content)
        return f"/uploads/{new_filename}"
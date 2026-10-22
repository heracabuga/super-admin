from fastapi import APIRouter, Depends, HTTPException

from database import db
from routes.grading.auth import get_grading_admin
from routes.grading.models.grade import Teacher, TeacherAccount, TeacherAccountCreate
from routes.grading.services import mongo_repo

router = APIRouter(prefix="/api/grading", tags=["grading-accounts"])


@router.get("/teachers", response_model=list[Teacher])
def list_teachers(_admin: dict = Depends(get_grading_admin)):
    return mongo_repo.list_teachers(db)


@router.get("/teacher-accounts", response_model=list[TeacherAccount])
def list_teacher_accounts(_admin: dict = Depends(get_grading_admin)):
    return mongo_repo.list_teacher_accounts(db)


@router.post("/teacher-accounts", response_model=TeacherAccount)
def create_teacher_account(payload: TeacherAccountCreate, _admin: dict = Depends(get_grading_admin)):
    email = payload.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password is too long (max 72 bytes).")
    try:
        return mongo_repo.create_teacher_account(db, payload.professor_id, email, payload.password)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
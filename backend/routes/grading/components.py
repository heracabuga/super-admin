"""
Backend for the admin "Grade Components" page.

GET    /grade-components            -> list current components
POST   /grade-components             -> "Add" button
PATCH  /grade-components/{id}        -> edit a component's label/percentage
DELETE /grade-components/{id}        -> "X" button, remove a component

Global — one set of components shared across every subject/section
(confirmed with the user). New collection: `grading_components`.
"""

from fastapi import APIRouter, Depends, HTTPException

from routes.grading.models.grade import GradeComponent, GradeComponentCreate, GradeComponentUpdate
from routes.grading.services import mongo_repo
from database import db
from routes.grading.auth import get_grading_admin

router = APIRouter(prefix="/api/grading/grade-components", tags=["grade-components"])


@router.get("", response_model=list[GradeComponent])
def list_grade_components(_admin: dict = Depends(get_grading_admin)):
    return mongo_repo.list_grade_components(db)


@router.post("", response_model=GradeComponent)
def add_grade_component(payload: GradeComponentCreate, _admin: dict = Depends(get_grading_admin)):
    label = payload.label.strip()
    if not label:
        raise HTTPException(status_code=400, detail="Label is required.")

    return mongo_repo.add_grade_component(db, label, payload.percentage)


@router.patch("/{component_id}", response_model=GradeComponent)
def update_grade_component(
    component_id: str,
    payload: GradeComponentUpdate,
    _admin: dict = Depends(get_grading_admin),
):
    label = payload.label.strip() if payload.label is not None else None
    if label is not None and not label:
        raise HTTPException(status_code=400, detail="Label cannot be empty.")

    updated = mongo_repo.update_grade_component(db, component_id, label, payload.percentage)
    if not updated:
        raise HTTPException(status_code=404, detail="Grade component not found.")
    return updated


@router.delete("/{component_id}")
def delete_grade_component(component_id: str, _admin: dict = Depends(get_grading_admin)):
    deleted = mongo_repo.delete_grade_component(db, component_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Grade component not found.")
    return {"deleted": True, "component_id": component_id}
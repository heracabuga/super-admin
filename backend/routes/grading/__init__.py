from fastapi import APIRouter

from routes.grading import accounts, components, view_grades, deadlines
router = APIRouter()
router.include_router(accounts.router)
router.include_router(components.router)
router.include_router(view_grades.router)
router.include_router(deadlines.router)
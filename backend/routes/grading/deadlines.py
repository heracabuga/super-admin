from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException

from database import db
from routes.grading.auth import get_grading_admin
from routes.grading.models.grade import Deadline, DeadlineSet, SendReminderRequest, ReminderLogEntry
from routes.grading.services import mongo_repo

router = APIRouter(prefix="/api/grading", tags=["grading-deadlines"])
PH_TZ = timezone(timedelta(hours=8))


def _check_term(term: str):
    if term not in mongo_repo.TERMS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown term '{term}'. Must be one of: {', '.join(mongo_repo.TERMS)}",
        )


@router.get("/deadlines", response_model=list[Deadline])
def list_deadlines(_admin: dict = Depends(get_grading_admin)):
    return mongo_repo.list_deadlines(db)


@router.post("/deadlines", response_model=Deadline)
def set_deadline(payload: DeadlineSet, _admin: dict = Depends(get_grading_admin)):
    _check_term(payload.term)
    return mongo_repo.set_deadline(db, payload.term, payload.deadline_date)


@router.post("/reminders/send", response_model=ReminderLogEntry)
def send_reminder(payload: SendReminderRequest, _admin: dict = Depends(get_grading_admin)):
    _check_term(payload.term)
    teacher_count = mongo_repo.get_active_teacher_count(db)
    sent_at = datetime.now(PH_TZ).strftime("%b %d, %Y %I:%M %p") + " PHT"
    entry = mongo_repo.add_reminder_log_entry(db, payload.term, teacher_count, sent_at)

    deadlines = {d.term: d.deadline_date for d in mongo_repo.list_deadlines(db)}
    deadline_date = deadlines.get(payload.term)
    deadline_text = f" Due {deadline_date}." if deadline_date else ""
    notif_time = datetime.now(PH_TZ).strftime("%b %d, %I:%M %p")
    mongo_repo.add_notification(
        db,
        f"{payload.term} grades are due soon, please submit on time.{deadline_text}",
        notif_time,
    )
    return entry


@router.get("/reminders/log", response_model=list[ReminderLogEntry])
def get_reminder_log(_admin: dict = Depends(get_grading_admin)):
    return mongo_repo.list_reminder_log(db)
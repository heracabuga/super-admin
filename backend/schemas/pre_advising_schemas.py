from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Literal
from datetime import datetime, timezone

# ----------------------------------------
# ADVISING RECORD SCHEMA
# ----------------------------------------
class AdvisedSubject(BaseModel):
    subjectId: str
    targetProgram: Optional[str] = None
    targetYear: Optional[str] = None
    targetSection: Optional[str] = None
    targetSemester: Optional[str] = None
    droppedSubjectId: Optional[str] = None

class AdvisingRecord(BaseModel):
    advisingId: str
    applicantID: str
    isApplicant: Optional[bool] = False  # Allows routing to the correct DB collection
    enrollmentStatus: str = Field(default="advised")
    status: Optional[Literal["regular", "irregular"]] = None
    termId: Optional[str] = None
    year: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[str] = None
    totalUnitsApproved: Optional[float] = None
    advisedSubjects: List[AdvisedSubject] = []
    
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ----------------------------------------
# SCHEDULE REQUEST SCHEMA
# ----------------------------------------
class ScheduleRequest(BaseModel):
    scheduleId: str
    schedule: Any 
    section: Optional[str] = None
    year: Optional[str] = None
    status: Literal['pending', 'approved', 'rejected'] = Field(default='pending')
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ----------------------------------------
# EXTERNAL SCHEDULE SCHEMA
# ----------------------------------------
class ExternalSchedule(BaseModel):
    subjectCode: str
    subjectTitle: str
    units: float = Field(default=3)
    hours: float = Field(default=3)
    externalSection: str
    day: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    startTime: str
    endTime: str
    roomName: str = Field(default="TBA")
    profName: str = Field(default="TBA")
    activeTerm: str
    
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator('subjectCode', 'subjectTitle', 'externalSection', 'roomName', 'profName')
    @classmethod
    def trim_strings(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator('subjectCode')
    @classmethod
    def uppercase_subject_code(cls, v):
        if isinstance(v, str):
            return v.upper()
        return v

# ----------------------------------------
# SYSTEM SETTINGS SCHEMA
# ----------------------------------------
class SystemSettings(BaseModel):
    setting_id: str = Field(default="GLOBAL_CONFIG")
    activeSemesterShort: str
    activeTermString: str

# ----------------------------------------
# GRADES SCHEMA (Old Schema Compatibility)
# ----------------------------------------
class GradeItem(BaseModel):
    subjectCode: Optional[str] = None
    subjectTitle: Optional[str] = None
    units: Optional[str] = None
    prelim: Optional[str] = None
    midterm: Optional[str] = None
    preFinal: Optional[str] = None
    final: Optional[str] = None
    finalGrade: Optional[str] = None
    status: Optional[str] = None

class AcademicRecord(BaseModel):
    schoolYear: Optional[str] = None
    semester: Optional[str] = None
    grades: List[GradeItem] = []

class GradesSchema(BaseModel):
    studentNumber: str
    program: Optional[str] = None
    totalUnitsEarned: Optional[float] = None
    academicRecords: List[AcademicRecord] = []
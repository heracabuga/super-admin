from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, model_validator
import re
from typing import Optional, List, Dict, Any

class BasePayload(BaseModel):
    model_config = ConfigDict(extra='ignore')

# ----------------
# COMMON PAYLOADS
# ----------------
class LoginPayload(BasePayload):
    email: str
    password: str
    role: Optional[str] = None

class SendOtpPayload(BasePayload):
    email: EmailStr
    role: Optional[str] = None

class VerifyOtpPayload(BasePayload):
    email: EmailStr
    otp: str
    role: Optional[str] = None

class ForgotPasswordPayload(BasePayload):
    email: EmailStr
    role: Optional[str] = None

class ResetPasswordPayload(BasePayload):
    email: Optional[EmailStr] = None
    otp: Optional[str] = None
    newPassword: str
    confirmPassword: Optional[str] = None
    role: Optional[str] = None

# ----------------
# ADMIN PAYLOADS
# ----------------
class ChangePasswordPayload(BasePayload):
    current_password: Optional[str] = None
    currentPassword: Optional[str] = None
    new_password: Optional[str] = None
    newPassword: Optional[str] = None
    confirm_password: Optional[str] = None
    confirmPassword: Optional[str] = None

class VerifyPasswordPayload(BasePayload):
    password: str

class AdminProfileUpdatePayload(BasePayload):
    name: Optional[str] = None
    username: Optional[str] = None

class Verify2FaPayload(BasePayload):
    email: EmailStr
    otp: str

class CreateAdminPayload(BasePayload):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    role: str

class UpdateAdminPayload(BasePayload):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None

class CreateLogPayload(BasePayload):
    action: str
    details: Optional[str] = None
    status: Optional[str] = "Success"

class CoursePayload(BasePayload):
    name: str
    abbreviation: str
    institute: str
    limit: Optional[int] = 0
    applicationLimit: Optional[int] = 0
    hasBoardExam: Optional[bool] = False
    allowedApplicantTypes: Optional[List[str]] = ["SHS Graduate", "Transferee", "ALS"]

class InstitutePayload(BasePayload):
    name: str
    abbreviation: str
    address: Optional[str] = ""
    dailyLimit: Optional[int] = 0
    blockedDates: Optional[List[str]] = []
    requiresInterview: Optional[bool] = True

class EncodeScorePayload(BasePayload):
    score: float
    ratings: Optional[Dict[str, Any]] = None
    interviewDate: Optional[str] = None
    interviewer: Optional[str] = None

class UpdateInterviewStatusPayload(BasePayload):
    status: str
    interviewDate: Optional[str] = None

class BulkUpdateStatusPayload(BasePayload):
    applicantIds: List[str]
    status: str

class EmailDataPayload(BasePayload):
    email: Optional[str] = None
    recipientEmail: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    applicantId: Optional[str] = None
    type: Optional[str] = None
    htmlMessage: Optional[str] = None
    hardcopySubmissionDeadline: Optional[str] = None

    @model_validator(mode='after')
    def resolve_email(self):
        if not self.email and self.recipientEmail:
            self.email = self.recipientEmail
        return self

class SendBulkEmailsPayload(BasePayload):
    emails: List[EmailDataPayload]
    hardcopySubmissionDeadline: Optional[str] = None

class ReassignProgramPayload(BasePayload):
    newProgram: Optional[str] = None
    new_program: Optional[str] = None

    @model_validator(mode='after')
    def validate_new_program(self):
        prog = self.newProgram or self.new_program
        if not prog or not prog.strip():
            raise ValueError("newProgram is required")
        self.newProgram = prog.strip()
        self.new_program = prog.strip()
        return self

class UpdateStatusPayload(BasePayload):
    status: Optional[str] = None
    examScore: Optional[float] = None
    interviewScore: Optional[float] = None
    gwa: Optional[str] = None
    totalPerc: Optional[float] = None
    slotStatus: Optional[str] = None
    bcetRawScore: Optional[float] = None
    bcetHighestScore: Optional[float] = None

class UpdateEmailTemplatePayload(BasePayload):
    model_config = ConfigDict(extra='allow')
    subject: Optional[str] = None
    message: Optional[str] = None
    content: Optional[str] = None
    templates: Optional[List[Dict[str, Any]]] = None

# For applicant and generic dict payloads where the structure is massive or completely dynamic:
class GenericDictPayload(BasePayload):
    model_config = ConfigDict(extra='allow')

    @model_validator(mode='before')
    @classmethod
    def reject_operator_injection(cls, data: Any) -> Any:
        def _check_keys(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if isinstance(k, str) and (k.startswith('$') or '.' in k):
                        raise ValueError(f"Restricted operator or path character in payload key: '{k}'")
                    _check_keys(v)
            elif isinstance(obj, list):
                for item in obj:
                    _check_keys(item)
        if isinstance(data, dict):
            _check_keys(data)
        return data

# ----------------
# APPLICANT PAYLOADS
# ----------------
class RegisterPayload(BasePayload):
    email: EmailStr
    password: str
    otp: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phoneNumber: Optional[str] = None
    signupType: Optional[str] = None
    schoolYear: Optional[str] = None
    confirmPassword: Optional[str] = None

    @field_validator("phoneNumber", mode="before")
    @classmethod
    def validate_phone_number(cls, v):
        if v is None or v == "":
            return None
        v_str = str(v).strip()
        if not re.match(r"^09\d{9}$", v_str):
            raise ValueError("Phone number must start with '09' and be exactly 11 digits.")
        return v_str

class SendSignupOtpPayload(BasePayload):
    email: EmailStr

class SetApplicantTypePayload(BasePayload):
    applicantType: str

class AdmissionDecisionPayload(BasePayload):
    applicantId: str
    isAccepted: bool

class AcceptOfferPayload(BasePayload):
    tracking_slug: Optional[str] = None
    slug: Optional[str] = None
    id: Optional[str] = None

class AcceptApplicationPayload(BasePayload):
    applicantId: Optional[str] = None
    remarks: Optional[str] = None

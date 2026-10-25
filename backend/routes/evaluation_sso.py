"""
Single sign-on from the Super Admin into the Faculty Evaluation system.

When an admin who is logged in to the Super Admin opens the Evaluation System
tab, the frontend asks this endpoint for a short-lived token (60 seconds,
usable once) and opens the Faculty Evaluation with it. The Faculty Evaluation
backend checks the signature with the same secret and logs the person in, so
there is no second login and no password travels between the systems.

Setup:
  1. Put the SAME long random value in the .env of BOTH backends:
         EVAL_SSO_SECRET=...        (this backend)
         SSO_SHARED_SECRET=...      (the Faculty Evaluation backend)
     Make one with:  python -c "import secrets; print(secrets.token_urlsafe(48))"
     Never commit it to GitHub.
  2. In main.py add the two lines shown at the bottom of this file.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time

from fastapi import APIRouter, Body, Depends, HTTPException

from middlewares.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Evaluation SSO"])

GUEST_ID = "000000000000000000000000"   # what get_current_user returns for nobody
ALLOWED_ROLES = ("faculty_admin", "dean")
TOKEN_SECONDS = 60


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


@router.post("/evaluation-sso")
async def evaluation_sso(payload: dict = Body(default={}), user: dict = Depends(get_current_user)):
    # Only a really logged-in admin. Do NOT use admin_only here: for a caller
    # with no login it quietly substitutes the first admin in the database.
    if user.get("id") in (None, "", GUEST_ID) or user.get("role") not in ("Admin", "SuperAdmin"):
        raise HTTPException(status_code=401, detail="Please log in as an admin.")

    secret = (os.getenv("EVAL_SSO_SECRET") or "").strip()
    if not secret:
        raise HTTPException(status_code=503, detail="EVAL_SSO_SECRET is not set in this backend's .env.")

    role = payload.get("role") if payload.get("role") in ALLOWED_ROLES else "faculty_admin"

    now = int(time.time())
    body = _b64(json.dumps({
        "iss": "super-admin",
        "aud": "faculty-evaluation",
        "sub": str(user["id"]),
        "role": role,
        "iat": now,
        "exp": now + TOKEN_SECONDS,
        "jti": secrets.token_hex(12),
    }, separators=(",", ":")).encode("utf-8"))
    signature = _b64(hmac.new(secret.encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest())

    return {"sso": f"{body}.{signature}"}


# ---- In main.py, add these two lines ---------------------------------------
# near the other imports:   from routes import evaluation_sso
# near the other routers:   app.include_router(evaluation_sso.router)
# -----------------------------------------------------------------------------

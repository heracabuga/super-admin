import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

ADMIN_ROLES = {"Admin", "SuperAdmin"}

bearer_scheme = HTTPBearer(auto_error=False)


def get_grading_admin(creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if creds is None or not creds.credentials.strip():
        raise HTTPException(status_code=401, detail="Not logged in.")
    token = creds.credentials.strip()

    # Same fallback chain as routes/admin_auth.py so the secrets always match.
    secret = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or "my_super_secret_key_2026"
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Your session has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid login token. Please log in again.")

    if payload.get("role") not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return payload
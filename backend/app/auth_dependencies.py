from fastapi import Depends
from app.auth import get_current_user

require_auth = Depends(get_current_user)

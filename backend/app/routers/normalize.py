from fastapi import APIRouter
from pydantic import BaseModel

from app.normalizers.ioc import normalize_ioc


router = APIRouter(
    prefix="/api/normalize",
    tags=["Normalization"],
)


class NormalizeRequest(BaseModel):
    ioc_type: str
    value: str


@router.post("/")
def normalize(request: NormalizeRequest):
    return normalize_ioc(
        request.ioc_type,
        request.value,
    )

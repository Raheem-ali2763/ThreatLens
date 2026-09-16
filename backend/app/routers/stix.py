import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ioc import IOC


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


def stix_id(kind: str):
    return f"{kind}--{uuid.uuid4()}"


def escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def make_pattern(ioc_type: str, value: str):
    value = escape(value)

    if ioc_type == "ip":
        return f"[ipv4-addr:value = '{value}']"

    if ioc_type == "domain":
        return f"[domain-name:value = '{value}']"

    if ioc_type == "url":
        return f"[url:value = '{value}']"

    if ioc_type == "email":
        return f"[email-addr:value = '{value}']"

    if ioc_type == "hash":
        return f"[file:hashes.MD5 = '{value}']"

    return f"[x-threatlens-ioc:value = '{value}']"


@router.get("/stix")
def export_stix(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    objects = []

    identity_id = stix_id("identity")

    objects.append({
        "type": "identity",
        "spec_version": "2.1",
        "id": identity_id,
        "created": now,
        "modified": now,
        "name": "ThreatLens",
        "identity_class": "organization",
    })

    iocs = (
        db.query(IOC)
        .order_by(IOC.id)
        .all()
    )

    for ioc in iocs:
        confidence = ioc.confidence or 0

        indicator = {
            "type": "indicator",
            "spec_version": "2.1",
            "id": stix_id("indicator"),
            "created": now,
            "modified": now,
            "name": f"ThreatLens IOC: {ioc.value}",
            "description": (
                f"IOC imported from ThreatLens source "
                f"{ioc.source or 'unknown'}."
            ),
            "pattern": make_pattern(
                ioc.ioc_type,
                ioc.value,
            ),
            "pattern_type": "stix",
            "valid_from": now,
            "confidence": confidence,
            "labels": [
                tag.strip()
                for tag in (ioc.tags or "").split(",")
                if tag.strip()
            ],
            "created_by_ref": identity_id,
        }

        objects.append(indicator)

    bundle = {
        "type": "bundle",
        "id": stix_id("bundle"),
        "objects": objects,
    }

    content = json.dumps(
        bundle,
        indent=2,
        default=str,
    )

    return StreamingResponse(
        iter([content]),
        media_type="application/stix+json;version=2.1",
        headers={
            "Content-Disposition":
                "attachment; filename=threatlens-stix-2.1.json"
        },
    )

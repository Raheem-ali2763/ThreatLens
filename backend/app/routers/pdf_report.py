from io import BytesIO
from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

from app.database import get_db
from app.models.ioc import IOC
from app.models.event import InternalEvent
from app.models.alert import Alert
from app.models.incident import Incident


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db)):
    iocs = db.query(IOC).order_by(IOC.id).all()
    events = db.query(InternalEvent).order_by(InternalEvent.id).all()
    alerts = db.query(Alert).order_by(Alert.id).all()
    incidents = db.query(Incident).order_by(Incident.id).all()

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ThreatLensTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=26,
        spaceAfter=12,
    )

    heading_style = ParagraphStyle(
        "ThreatLensHeading",
        parent=styles["Heading2"],
        fontSize=15,
        leading=18,
        spaceBefore=12,
        spaceAfter=8,
    )

    normal_style = ParagraphStyle(
        "ThreatLensNormal",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
    )

    story = []

    # =====================================================
    # TITLE
    # =====================================================
    story.append(Paragraph(
        "ThreatLens",
        title_style,
    ))

    story.append(Paragraph(
        "Cyber Threat Intelligence Report",
        styles["Heading2"],
    ))

    story.append(Paragraph(
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
        normal_style,
    ))

    story.append(Spacer(1, 12))

    # =====================================================
    # SUMMARY
    # =====================================================
    story.append(Paragraph(
        "Executive Summary",
        heading_style,
    ))

    summary_data = [
        ["Metric", "Count"],
        ["Total IOCs", str(len(iocs))],
        ["Internal Events", str(len(events))],
        ["Alerts", str(len(alerts))],
        ["Incidents", str(len(incidents))],
        [
            "Open Alerts",
            str(sum(1 for x in alerts if x.status == "open")),
        ],
        [
            "Open Incidents",
            str(sum(1 for x in incidents if x.status == "open")),
        ],
    ]

    summary_table = Table(
        summary_data,
        colWidths=[90 * mm, 50 * mm],
    )

    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18233d")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 7),
    ]))

    story.append(summary_table)
    story.append(Spacer(1, 15))

    # =====================================================
    # IOC SECTION
    # =====================================================
    story.append(Paragraph(
        "Indicators of Compromise",
        heading_style,
    ))

    ioc_data = [
        ["ID", "Type", "Value", "Source", "Confidence"]
    ]

    for x in iocs:
        ioc_data.append([
            str(x.id),
            x.ioc_type or "",
            Paragraph(str(x.value), normal_style),
            x.source or "",
            str(x.confidence or 0),
        ])

    if len(ioc_data) == 1:
        ioc_data.append(["-", "No IOCs", "-", "-", "-"])

    ioc_table = Table(
        ioc_data,
        colWidths=[12 * mm, 25 * mm, 70 * mm, 30 * mm, 25 * mm],
        repeatRows=1,
    )

    ioc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18233d")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    story.append(ioc_table)

    # =====================================================
    # EVENTS
    # =====================================================
    story.append(Paragraph(
        "Internal Security Events",
        heading_style,
    ))

    event_data = [
        ["ID", "Type", "Source IP", "Destination", "Severity"]
    ]

    for x in events:
        event_data.append([
            str(x.id),
            x.event_type or "",
            x.source_ip or "",
            x.destination_ip or x.destination_domain or "",
            x.severity or "",
        ])

    if len(event_data) == 1:
        event_data.append(["-", "No events", "-", "-", "-"])

    event_table = Table(
        event_data,
        colWidths=[12 * mm, 40 * mm, 35 * mm, 55 * mm, 25 * mm],
        repeatRows=1,
    )

    event_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18233d")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))

    story.append(event_table)

    # =====================================================
    # ALERTS
    # =====================================================
    story.append(Paragraph(
        "Security Alerts",
        heading_style,
    ))

    alert_data = [
        ["ID", "Title", "Severity", "Status"]
    ]

    for x in alerts:
        alert_data.append([
            str(x.id),
            Paragraph(str(x.title), normal_style),
            x.severity or "",
            x.status or "",
        ])

    if len(alert_data) == 1:
        alert_data.append(["-", "No alerts", "-", "-"])

    alert_table = Table(
        alert_data,
        colWidths=[15 * mm, 95 * mm, 30 * mm, 30 * mm],
        repeatRows=1,
    )

    alert_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18233d")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    story.append(alert_table)

    # =====================================================
    # INCIDENTS
    # =====================================================
    story.append(Paragraph(
        "Security Incidents",
        heading_style,
    ))

    incident_data = [
        ["ID", "Title", "Severity", "Status", "Alert"]
    ]

    for x in incidents:
        incident_data.append([
            str(x.id),
            Paragraph(str(x.title), normal_style),
            x.severity or "",
            x.status or "",
            str(x.alert_id or ""),
        ])

    if len(incident_data) == 1:
        incident_data.append(["-", "No incidents", "-", "-", "-"])

    incident_table = Table(
        incident_data,
        colWidths=[12 * mm, 90 * mm, 28 * mm, 28 * mm, 20 * mm],
        repeatRows=1,
    )

    incident_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18233d")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    story.append(incident_table)

    story.append(Spacer(1, 20))

    story.append(Paragraph(
        "Generated by ThreatLens Cyber Threat Intelligence Platform.",
        normal_style,
    ))

    doc.build(story)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=threatlens-report.pdf"
        },
    )

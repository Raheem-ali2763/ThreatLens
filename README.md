# 🛡️ ThreatLens

### Cyber Threat Intelligence & SOC Investigation Platform

ThreatLens is a cybersecurity platform that collects threat intelligence, normalizes and deduplicates IOCs, enriches threat data, calculates severity, correlates threats with internal security events, generates alerts and incidents, and provides a SOC-style investigation dashboard.

---

## 🚀 Key Features

- 🔐 JWT Authentication
- 🧩 IOC Management
- 🌐 Threat Intelligence Sources
- 🔄 IOC Normalization & Deduplication
- 🔎 Threat Intelligence Enrichment
- 📊 Risk & Severity Scoring
- 🔗 Internal Event Correlation
- 🚨 Real-Time Security Alerts
- 🧯 Incident Management
- 🕵️ Threat Hunting
- 📡 WebSocket Real-Time Updates
- 📄 CSV Reports
- 🧬 STIX 2.1 Export
- 📑 PDF Reports
- 📁 File Scanner
- 🔗 URL Scanner
- 📦 Batch IOC Scanner
- 📈 SOC Dashboard

---

## 🧠 ThreatLens Workflow

```mermaid
flowchart LR
    A[Threat Sources] --> B[Ingestion]
    B --> C[Normalization]
    C --> D[Deduplication]
    D --> E[Enrichment]
    E --> F[Severity Scoring]
    F --> G[Internal Event Correlation]
    G --> H[Alert Engine]
    H --> I[Incident Management]
    I --> J[SOC Dashboard]
    J --> K[Investigation & Reporting]

Threat Intelligence Sources
        │
        ▼
     Ingestion
        │
        ▼
   Normalization
        │
        ▼
   Deduplication
        │
        ▼
    Enrichment
        │
        ▼
  Risk Scoring
        │
        ▼
Internal Correlation
        │
        ▼
      Alerts
        │
        ▼
    Incidents
        │
        ▼
  SOC Dashboard
        │
        ▼
 Investigation
 & Reporting
Threat Intelligence Sources
        │
        ▼
     Ingestion
        │
        ▼
   Normalization
        │
        ▼
   Deduplication
        │
        ▼
    Enrichment
        │
        ▼
  Risk Scoring
        │
        ▼
Internal Correlation
        │
        ▼
      Alerts
        │
        ▼
    Incidents
        │
        ▼
  SOC Dashboard
        │
        ▼
 Investigation
 & Reporting

# ThreatLens Architecture

## Core Threat Intelligence Pipeline

```mermaid
flowchart TD
    A[Threat Intelligence Sources] --> B[Ingestion]
    B --> C[Normalization]
    C --> D[Deduplication]
    D --> E[Enrichment]
    E --> F[Severity Scoring]
    F --> G[Internal Event Correlation]
    G --> H[Alert Engine]
    H --> I[Incident Management]
    I --> J[SOC Dashboard]
    J --> K[Investigation & Reporting]
Components
1. Threat Intelligence Sources

External threat intelligence providers supply indicators such as IP addresses, domains, URLs and file hashes.

2. Ingestion

Threat data is collected and processed by the ThreatLens backend.

3. Normalization

Different threat-source formats are converted into a common IOC structure.

4. Deduplication

Duplicate indicators are identified and existing IOC records are updated.

5. Enrichment

Additional threat intelligence can be retrieved from supported providers.

6. Severity Scoring

Threat indicators receive a 0–100 risk score.

7. Internal Event Correlation

Threat indicators are compared with internal security events.

8. Alert Engine

Matching suspicious activity can generate security alerts.

9. Incident Management

Important alerts can be associated with incidents for investigation and resolution.

10. SOC Dashboard

Security analysts can monitor IOCs, events, alerts, incidents and threat activity.

11. Reporting

Security investigation data can be exported through CSV, STIX and PDF reports.

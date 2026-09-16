from typing import Any


class RiskScoringEngine:

    def calculate(
        self,
        malicious: int = 0,
        suspicious: int = 0,
        source_count: int = 1,
        confidence: int = 0,
        is_kev: bool = False,
        recent: bool = False,
    ) -> dict[str, Any]:

        score = 0

        # VirusTotal malicious detections: maximum 40 points
        score += min(malicious * 4, 40)

        # Suspicious detections: maximum 10 points
        score += min(suspicious * 2, 10)

        # Multiple threat sources: maximum 20 points
        score += min(source_count * 5, 20)

        # High confidence: 10 points
        if confidence >= 80:
            score += 10

        # CISA KEV: 20 points
        if is_kev:
            score += 20

        # Recent IOC: 10 points
        if recent:
            score += 10

        score = min(score, 100)

        if score >= 85:
            severity = "critical"
        elif score >= 60:
            severity = "high"
        elif score >= 30:
            severity = "medium"
        else:
            severity = "low"

        return {
            "score": score,
            "severity": severity,
        }


risk_engine = RiskScoringEngine()

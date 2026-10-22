import re
import time
import hashlib
from typing import List, Dict, Any, Tuple
from ..models import (
    ScanRequest, ScanResult, ViolationItem, ScoreBreakdown, BrandRule, Severity, PIIFlag, RuleCategory
)
from .tone_analyzer import ToneAnalyzer
from .claims_verifier import ClaimsVerifier
from .terminology_filter import TerminologyFilter

class GovernanceScanner:
    def __init__(self, rules: List[BrandRule]):
        self.rules = rules
        self.tone_analyzer = ToneAnalyzer(rules)
        self.claims_verifier = ClaimsVerifier(rules)
        self.terminology_filter = TerminologyFilter(rules)

    def scrub_pii(self, text: str) -> Tuple[List[PIIFlag], str]:
        pii_flags: List[PIIFlag] = []
        scrubbed = text

        patterns = [
            ("AWS_ACCESS_KEY", r'\b(AKIA[0-9A-Z]{16})\b'),
            ("SECRET_API_KEY", r'\b(sk-[a-zA-Z0-9_-]{24,})\b'),
            ("BEARER_TOKEN", r'\bBearer\s+([a-zA-Z0-9_\-\.]{20,})\b'),
            ("EMAIL_ADDRESS", r'\b([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b'),
            ("CREDIT_CARD", r'\b(\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4})\b')
        ]

        for p_type, pat in patterns:
            for match in re.finditer(pat, text):
                raw = match.group(1) if match.groups() else match.group(0)
                masked = raw[:3] + "••••••••" + (raw[-3:] if len(raw) > 6 else "")
                pii_flags.append(PIIFlag(
                    type=p_type,
                    masked_preview=masked,
                    start_char=match.start(),
                    end_char=match.end()
                ))

        return pii_flags, scrubbed

    def scan(self, req: ScanRequest) -> ScanResult:
        start_time = time.perf_counter()
        content = req.content or ""

        # PII & Secret Scrubber
        pii_flags: List[PIIFlag] = []
        if req.scrub_pii:
            pii_flags, _ = self.scrub_pii(content)

        # Compute deterministic SHA-256 hash
        content_hash = "SHA256:" + hashlib.sha256(content.encode('utf-8')).hexdigest()

        # Run analyzers
        tone_violations, tone_score, formality, sentiment = self.tone_analyzer.analyze(content)
        fact_violations, fact_score = self.claims_verifier.verify(content)
        term_violations, term_score = self.terminology_filter.filter(content)

        # Merge violations
        all_violations: List[ViolationItem] = []
        all_violations.extend(fact_violations) # Facts first (critical priority)
        all_violations.extend(term_violations)
        all_violations.extend(tone_violations)

        # If PII detected, add warning violation
        for pii in pii_flags:
            all_violations.insert(0, ViolationItem(
                rule_id=f"RULE-SEC-{pii.type}",
                rule_name=f"Potential Secret / {pii.type.replace('_', ' ')} Detected",
                category=RuleCategory.PRODUCT_FACTS,
                severity=Severity.CRITICAL,
                flagged_text=pii.masked_preview,
                start_char=pii.start_char,
                end_char=pii.end_char,
                line_number=content[:pii.start_char].count('\n') + 1,
                guideline_citation="Section 5.4 — Confidential Information & Secret Zero-Leakage",
                guideline_excerpt="Raw API credentials, private customer emails, and authentication tokens must never appear in outbound collateral.",
                ai_rationale="Publicly exposing secrets causes instant credential compromise and data protection regulatory liability.",
                suggested_fix="[REDACTED_SECURE_TOKEN]",
                applied=False
            ))

        # Deduplicate overlapping matches
        deduped: List[ViolationItem] = []
        seen_spans = set()
        for v in all_violations:
            span_key = (v.start_char, v.end_char)
            if span_key not in seen_spans:
                seen_spans.add(span_key)
                deduped.append(v)

        deduped.sort(key=lambda x: x.start_char)

        # Compute Clarity Score
        words = re.findall(r'\b[A-Za-z0-9\'-]+\b', content)
        word_count = len(words)
        sentences = [s for s in re.split(r'[.!?]+', content) if s.strip()]
        avg_sentence_len = word_count / max(1, len(sentences))
        
        clarity_score = 100
        if avg_sentence_len > 25:
            clarity_score -= 20
        elif avg_sentence_len > 18:
            clarity_score -= 10

        # Overall weighted compliance score
        weighted_score = (
            fact_score * 0.40 +
            term_score * 0.25 +
            tone_score * 0.25 +
            clarity_score * 0.10
        )
        
        # Deduct for PII if present
        if pii_flags:
            weighted_score = min(40, weighted_score - 30)

        compliance_score = max(15, min(100, int(round(weighted_score))))

        if not deduped and word_count > 10:
            compliance_score = 100

        # Grade calculation
        if compliance_score >= 95:
            grade = "A+"
        elif compliance_score >= 88:
            grade = "A"
        elif compliance_score >= 78:
            grade = "B"
        elif compliance_score >= 65:
            grade = "C"
        elif compliance_score >= 50:
            grade = "D"
        else:
            grade = "F"

        reading_time = max(1, int(round((word_count / 200) * 60)))
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return ScanResult(
            compliance_score=compliance_score,
            grade=grade,
            score_breakdown=ScoreBreakdown(
                tone=tone_score,
                facts=fact_score,
                terminology=term_score,
                clarity=clarity_score
            ),
            total_words=word_count,
            reading_time_seconds=reading_time,
            sentiment_label=sentiment,
            formality_label=formality,
            violations=deduped,
            pii_detected=pii_flags,
            cryptographic_hash=content_hash,
            processing_time_ms=elapsed_ms,
            ephemeral=req.ephemeral
        )

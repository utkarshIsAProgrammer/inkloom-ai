import re
from typing import List, Dict, Any
from ..models import (
    ScanRequest, ScanResult, ViolationItem, ScoreBreakdown, BrandRule, Severity
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

    def scan(self, req: ScanRequest) -> ScanResult:
        content = req.content or ""
        
        # Run analyzers
        tone_violations, tone_score, formality, sentiment = self.tone_analyzer.analyze(content)
        fact_violations, fact_score = self.claims_verifier.verify(content)
        term_violations, term_score = self.terminology_filter.filter(content)

        # Merge violations
        all_violations: List[ViolationItem] = []
        all_violations.extend(fact_violations) # Facts first (critical priority)
        all_violations.extend(term_violations)
        all_violations.extend(tone_violations)

        # Deduplicate overlapping matches
        deduped: List[ViolationItem] = []
        seen_spans = set()
        for v in all_violations:
            span_key = (v.start_char, v.end_char)
            if span_key not in seen_spans:
                seen_spans.add(span_key)
                deduped.append(v)

        # Sort violations by start_char
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
        # Facts: 40%, Terminology: 25%, Tone: 25%, Clarity: 10%
        weighted_score = (
            fact_score * 0.40 +
            term_score * 0.25 +
            tone_score * 0.25 +
            clarity_score * 0.10
        )
        
        compliance_score = max(15, min(100, int(round(weighted_score))))

        # If zero violations found and non-empty content
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

        reading_time = max(1, int(round((word_count / 200) * 60))) # words per min

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
            violations=deduped
        )

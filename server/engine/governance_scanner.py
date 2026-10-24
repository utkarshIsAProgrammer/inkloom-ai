import re
import time
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from ..models import (
    ScanRequest, ScanResult, ViolationItem, ScoreBreakdown, BrandRule, Severity, PIIFlag, RuleCategory
)
from .tone_analyzer import ToneAnalyzer
from .claims_verifier import ClaimsVerifier
from .terminology_filter import TerminologyFilter
from .ai_engine import AIAnalysis

# High-frequency English words used to tell running prose from keyboard mash.
# Coverage of this list is one half of the readability signal below.
COMMON_WORDS = frozenset("""
a about after all also am an and any are as at be because been being but by can could
did do does doing down during each few for from further get got had has have having he
her here hers herself him himself his how i if in into is it its itself just let me more
most must my myself no nor not of off on once only or other ought our ours ourselves out
over own same she should so some such than that the their theirs them themselves then
there these they this those through to too under until up very was we were what when
where which while who whom why will with would you your yours yourself yourselves
new next real time work team teams user users data day days year years need needs
way part read run see show use used using good best great top free fast help make made
can must may one two three first second live full open end start send sent scan scans
draft drafts review reviews rule rules score scores text copy brand content section
page click buy now like even still here all any some yes
""".split())

_VOWELS = set("aeiouy")
_CONSONANT_RUN = re.compile(r"[^aeiouy]+")


def _normalise_token(token: str) -> str:
    t = token.lower()
    if t.endswith("'s"):
        t = t[:-2]
    elif len(t) > 3 and t.endswith("s") and not t.endswith("ss") and not t.endswith("us"):
        t = t[:-1]
    return t


def _wordlike(token: str) -> bool:
    """Shape check: no embedded digits, at least one vowel, no long consonant stabs."""
    if any(ch.isdigit() for ch in token):
        return False
    letters = re.sub(r"[^A-Za-z]", "", token).lower()
    if not letters or not (set(letters) & _VOWELS):
        return False
    longest = max((len(m.group(0)) for m in _CONSONANT_RUN.finditer(letters)), default=0)
    return longest <= 5


def readability_quality(text: str) -> float:
    """0.0–1.0 estimate of how much the text reads like running English prose.

    Combines word shape (vowels, consonant runs, digit mixes) with coverage of
    high-frequency English words. Gibberish scores near 0; ordinary copy scores
    0.6 and above.
    """
    tokens = re.findall(r"[A-Za-z0-9']+", text)
    alpha = [t for t in tokens if re.search(r"[A-Za-z]", t)]
    if not alpha:
        return 0.0
    if len(alpha) < 3:
        return 0.5  # too little text to judge either way
    wordlike = sum(1 for t in alpha if _wordlike(t)) / len(alpha)
    common = sum(
        1 for t in alpha
        if t.lower() in COMMON_WORDS or _normalise_token(t) in COMMON_WORDS
    ) / len(alpha)
    scaled_common = max(0.0, min(1.0, (common - 0.05) / 0.90))
    return 0.6 * wordlike + 0.4 * scaled_common


def _readability_factor(quality: float) -> float:
    """Maps readability to a 0.1–1.0 multiplier applied to the clarity score."""
    if quality >= 0.60:
        return 1.0
    return max(0.1, min(1.0, (quality - 0.15) / 0.45))


_SEVERITY_RANK = {Severity.CRITICAL: 0, Severity.WARNING: 1, Severity.INFO: 2}


def _clamp_score(value: int) -> int:
    return max(0, min(100, int(value)))


class GovernanceScanner:
    def __init__(self, rules: List[BrandRule]):
        self.rules = rules
        self.tone_analyzer = ToneAnalyzer(rules)
        self.claims_verifier = ClaimsVerifier(rules)
        self.terminology_filter = TerminologyFilter(rules)

    @staticmethod
    def _mask_piece(raw: str) -> str:
        """Length-preserving mask so every downstream character offset stays valid."""
        if len(raw) <= 6:
            return "•" * len(raw)
        return raw[:3] + "•" * (len(raw) - 6) + raw[-3:]

    def scrub_pii(self, text: str) -> Tuple[List[PIIFlag], str]:
        """Flag every secret/PII match and return a masked copy of the text.

        The mask keeps the original length, so offsets computed on either
        version are interchangeable.
        """
        patterns = [
            ("AWS_ACCESS_KEY", r'\b(AKIA[0-9A-Z]{16})\b'),
            ("SECRET_API_KEY", r'\b(sk-[a-zA-Z0-9_-]{24,})\b'),
            ("BEARER_TOKEN", r'\bBearer\s+([a-zA-Z0-9_\-\.]{20,})\b'),
            ("EMAIL_ADDRESS", r'\b([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b'),
            ("CREDIT_CARD", r'\b(\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4})\b')
        ]

        matches = []
        for p_type, pat in patterns:
            for match in re.finditer(pat, text):
                has_group = match.lastindex is not None and match.lastindex >= 1
                g_start = match.start(1) if has_group else match.start()
                g_end = match.end(1) if has_group else match.end()
                raw = match.group(1) if has_group else match.group(0)
                matches.append((match.start(), match.end(), g_start, g_end, raw, p_type))

        # Keep the first of any overlapping matches, flag them in reading order.
        matches.sort(key=lambda m: (m[0], m[2]))
        pii_flags: List[PIIFlag] = []
        kept = []
        last_end = -1
        for m in matches:
            if m[0] < last_end:
                continue
            last_end = m[1]
            kept.append(m)
            pii_flags.append(PIIFlag(
                type=m[5],
                masked_preview=self._mask_piece(m[4]),
                start_char=m[0],
                end_char=m[1]
            ))

        # Replace from the back so earlier offsets remain valid while cutting.
        scrubbed = text
        for _, _, g_start, g_end, raw, _p_type in sorted(kept, key=lambda m: m[2], reverse=True):
            scrubbed = scrubbed[:g_start] + self._mask_piece(raw) + scrubbed[g_end:]

        return pii_flags, scrubbed

    def scan(self, req: ScanRequest) -> ScanResult:
        return self.scan_text(
            req.content or "",
            ephemeral=req.ephemeral,
            scrub_pii=req.scrub_pii,
        )

    def scan_text(
        self,
        content: str,
        ephemeral: bool = False,
        scrub_pii: bool = True,
        ai_analysis: Optional[AIAnalysis] = None,
    ) -> ScanResult:
        start_time = time.perf_counter()

        # PII & Secret Scrubber — mask first so analysis and reporting agree.
        pii_flags: List[PIIFlag] = []
        scrubbed = content
        if scrub_pii:
            pii_flags, scrubbed = self.scrub_pii(content)
        analysis = scrubbed if scrub_pii else content

        # Compute deterministic SHA-256 hash of the text actually analysed.
        content_hash = "SHA256:" + hashlib.sha256(analysis.encode('utf-8')).hexdigest()

        # Run analyzers
        tone_violations, tone_score, formality, sentiment = self.tone_analyzer.analyze(analysis)
        fact_violations, fact_score = self.claims_verifier.verify(analysis)
        term_violations, term_score = self.terminology_filter.filter(analysis)

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
                line_number=analysis[:pii.start_char].count('\n') + 1,
                guideline_citation="Section 5.4 — Confidential Information & Secret Zero-Leakage",
                guideline_excerpt="Raw API credentials, private customer emails, and authentication tokens must never appear in outbound collateral.",
                ai_rationale="Publicly exposing secrets causes instant credential compromise and data protection regulatory liability.",
                suggested_fix="[REDACTED_SECURE_TOKEN]",
                applied=False
            ))

        # Compute Clarity Score
        words = re.findall(r'\b[A-Za-z0-9\'-]+\b', analysis)
        word_count = len(words)
        sentences = [s for s in re.split(r'[.!?]+', analysis) if s.strip()]
        avg_sentence_len = word_count / max(1, len(sentences))

        clarity_score = 100
        if avg_sentence_len > 25:
            clarity_score -= 20
        elif avg_sentence_len > 18:
            clarity_score -= 10

        # Readability gate: gibberish must not inherit a perfect score just
        # because no banned phrase happens to match it.
        quality = readability_quality(analysis)
        clarity_score = int(round(clarity_score * _readability_factor(quality)))

        # Tone, facts and terminology cannot be judged on text nobody can
        # read — pull them down by the same factor so a failing report never
        # shows 100/100/100 next to an F. (When the AI runs, its verdict is
        # merged in on top of this; this keeps the fallback honest alone.)
        if quality < 0.50:
            unreadable_factor = _readability_factor(quality)
            tone_score = int(round(tone_score * unreadable_factor))
            fact_score = int(round(fact_score * unreadable_factor))
            term_score = int(round(term_score * unreadable_factor))
        clarity_score = max(0, min(100, clarity_score))

        # The AI verdict is authoritative on meaning; the deterministic scores
        # stay as a conservative floor. Merging with min() means the AI can
        # only ever lower a score — it can never inflate a passing grade.
        ai_violations: List[ViolationItem] = []
        if ai_analysis is not None:
            ai_violations = list(ai_analysis.violations)
            tone_score = min(tone_score, _clamp_score(ai_analysis.tone))
            fact_score = min(fact_score, _clamp_score(ai_analysis.facts))
            term_score = min(term_score, _clamp_score(ai_analysis.terminology))
            clarity_score = min(clarity_score, _clamp_score(ai_analysis.clarity))
            if ai_analysis.sentiment_label.strip():
                sentiment = ai_analysis.sentiment_label
            if ai_analysis.formality_label.strip():
                formality = ai_analysis.formality_label
            all_violations.extend(ai_violations)

        # Non-linguistic input (keyboard mash, placeholder junk) can never
        # certify, whatever the dimension scores say.
        ai_invalid = ai_analysis is not None and not ai_analysis.is_valid_copy
        if ai_invalid:
            clarity_score = min(clarity_score, 15)

        # The heuristic readability gate only speaks when the AI has not
        # already ruled on legibility, so one draft never gets two copies of
        # the same finding.
        if quality < 0.50 and not ai_invalid:
            preview = analysis[:60]
            all_violations.append(ViolationItem(
                rule_id="RULE-QUALITY-READABILITY",
                rule_name="Unreadable or non-linguistic draft",
                category=RuleCategory.TONE_OF_VOICE,
                severity=Severity.CRITICAL if quality < 0.30 else Severity.WARNING,
                flagged_text=preview,
                start_char=0,
                end_char=len(preview),
                line_number=1,
                guideline_citation="Section 1.1 — Readability & Plain Language",
                guideline_excerpt="Copy must be clear, natural English a reviewer can parse sentence by sentence. Random characters, keyboard input and unparseable text cannot be certified against the manual.",
                ai_rationale="An unreadable draft cannot be checked against the manual, so any passing score would be meaningless — it has to be rewritten in plain language first.",
                suggested_fix="Rewrite the flagged passage in clear, natural English.",
                applied=False
            ))
        elif ai_invalid:
            preview = analysis[:60]
            all_violations.append(ViolationItem(
                rule_id="RULE-QUALITY-READABILITY",
                rule_name="Not publishable copy — failed AI legibility review",
                category=RuleCategory.TONE_OF_VOICE,
                severity=Severity.CRITICAL,
                flagged_text=preview,
                start_char=0,
                end_char=len(preview),
                line_number=1,
                guideline_citation="Section 1.1 — Readability & Plain Language",
                guideline_excerpt="Copy must be clear, natural English a reviewer can parse sentence by sentence. Random characters, keyboard input and unparseable text cannot be certified against the manual.",
                ai_rationale=ai_analysis.copy_verdict or (
                    "The draft is not coherent, meaningful copy, so any passing score would be meaningless."
                ),
                suggested_fix="Rewrite the draft as complete, meaningful sentences before scanning.",
                applied=False
            ))

        # Deduplicate: when several checks flag the exact same span, keep the
        # most severe finding rather than whichever ran first.
        by_span: Dict[Tuple[int, int], ViolationItem] = {}
        for v in all_violations:
            span_key = (v.start_char, v.end_char)
            current = by_span.get(span_key)
            if current is None or _SEVERITY_RANK[v.severity] < _SEVERITY_RANK[current.severity]:
                by_span[span_key] = v
        deduped = sorted(by_span.values(), key=lambda x: x.start_char)

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

        # Cap the score by readability: unreadable text can never certify.
        if quality < 0.30:
            weighted_score = min(weighted_score, 35)
        elif quality < 0.50:
            weighted_score = min(weighted_score, 70)

        # The AI's legibility verdict is an even harder ceiling.
        if ai_invalid:
            weighted_score = min(weighted_score, 25)

        compliance_score = max(15, min(100, int(round(weighted_score))))

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
        # Include the model round-trip so the reported time is the full cost
        # of the scan, not just the local matcher's slice of it.
        elapsed_ms = round(
            (time.perf_counter() - start_time) * 1000
            + (ai_analysis.latency_ms if ai_analysis is not None else 0.0),
            2,
        )

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
            ephemeral=ephemeral,
            scrubbed_content=scrubbed if (scrub_pii and scrubbed != content) else None,
            analysis_mode="ai" if ai_analysis is not None else "heuristic",
            rule_coverage=list(ai_analysis.rule_checks) if ai_analysis is not None else []
        )

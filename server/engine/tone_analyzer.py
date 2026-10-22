import re
from typing import List, Tuple
from ..models import ViolationItem, RuleCategory, Severity, BrandRule

class ToneAnalyzer:
    def __init__(self, rules: List[BrandRule]):
        self.rules = [r for r in rules if r.category == RuleCategory.TONE_OF_VOICE and r.active]

    def analyze(self, text: str) -> Tuple[List[ViolationItem], int, str, str]:
        violations: List[ViolationItem] = []
        lower_text = text.lower()

        # Track penalties
        penalties = 0

        # Check for multiple exclamation marks
        for match in re.finditer(r'!{2,}', text):
            penalties += 5
            line_no = text[:match.start()].count('\n') + 1
            violations.append(ViolationItem(
                rule_id="RULE-TONE-EXCLAMATION",
                rule_name="Excessive Punctuation & Exclamation",
                category=RuleCategory.TONE_OF_VOICE,
                severity=Severity.INFO,
                flagged_text=match.group(0),
                start_char=match.start(),
                end_char=match.end(),
                line_number=line_no,
                guideline_citation="Section 1.3 — Typography & Punctuation Polish",
                guideline_excerpt="Use standard single punctuation. Multiple exclamation marks ('!!') dilute professional credibility.",
                ai_rationale="Over-punctuated text gives copy a frantic, unprofessional quality unfitting for enterprise communications.",
                suggested_fix=".",
                applied=False
            ))

        # Check against active tone rules
        for rule in self.rules:
            for term in rule.pattern_or_terms:
                pattern = re.compile(rf'\b{re.escape(term)}\b', re.IGNORECASE)
                for match in pattern.finditer(text):
                    penalty = 15 if rule.severity == Severity.CRITICAL else (10 if rule.severity == Severity.WARNING else 5)
                    penalties += penalty
                    line_no = text[:match.start()].count('\n') + 1

                    violations.append(ViolationItem(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        category=rule.category,
                        severity=rule.severity,
                        flagged_text=match.group(0),
                        start_char=match.start(),
                        end_char=match.end(),
                        line_number=line_no,
                        guideline_citation=rule.guideline_section,
                        guideline_excerpt=rule.guideline_text,
                        ai_rationale=rule.rationale,
                        suggested_fix=rule.suggested_fix,
                        applied=False
                    ))

        # Compute Tone Score (0 - 100)
        score = max(20, min(100, 100 - penalties))

        # Formality heuristic
        words = re.findall(r'\w+', text)
        word_count = len(words)
        avg_word_len = sum(len(w) for w in words) / max(1, word_count)
        
        formality = "Professional & Authoritative"
        if avg_word_len < 4.2 or "bruh" in lower_text or "no cap" in lower_text:
            formality = "Informal / Casual"
        elif avg_word_len > 5.5:
            formality = "Executive / Technical"

        sentiment = "Neutral & Evidence-Backed"
        if "!" in text or "thrilled" in lower_text or "excited" in lower_text:
            sentiment = "High Energy & Promotional"
        elif "foolish" in lower_text or "regret" in lower_text:
            sentiment = "Urgent / High-Pressure"

        return violations, score, formality, sentiment

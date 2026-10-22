import re
from typing import List, Tuple
from ..models import ViolationItem, RuleCategory, Severity, BrandRule

class ClaimsVerifier:
    def __init__(self, rules: List[BrandRule]):
        self.rules = [r for r in rules if r.category == RuleCategory.PRODUCT_FACTS and r.active]

    def verify(self, text: str) -> Tuple[List[ViolationItem], int]:
        violations: List[ViolationItem] = []
        penalties = 0

        # Heuristic search for unverified percentage claims like "100% guarantee", "100% risk free"
        unverified_100_pattern = re.compile(r'\b100%\s+(guarantee|safe|secure|risk[- ]free|bulletproof)\b', re.IGNORECASE)
        for match in unverified_100_pattern.finditer(text):
            penalties += 20
            line_no = text[:match.start()].count('\n') + 1
            violations.append(ViolationItem(
                rule_id="RULE-FACT-ABSOLUTE-CLAIM",
                rule_name="Unqualified Absolute Claim",
                category=RuleCategory.PRODUCT_FACTS,
                severity=Severity.CRITICAL,
                flagged_text=match.group(0),
                start_char=match.start(),
                end_char=match.end(),
                line_number=line_no,
                guideline_citation="Section 4.2 — Legal Disclaimers & Warranties",
                guideline_excerpt="Absolute warranty phrases ('100% risk free', '100% guarantee') create strict liability and are prohibited across commercial collateral.",
                ai_rationale="Absolutist marketing warranties forfeit standard enterprise liability protections in commercial litigation.",
                suggested_fix="industry-leading enterprise protection with standard warranty terms",
                applied=False
            ))

        # Check against active fact rules
        for rule in self.rules:
            for term in rule.pattern_or_terms:
                pattern = re.compile(rf'{re.escape(term)}', re.IGNORECASE)
                for match in pattern.finditer(text):
                    penalty = 25 if rule.severity == Severity.CRITICAL else (15 if rule.severity == Severity.WARNING else 8)
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

        score = max(15, min(100, 100 - penalties))
        return violations, score

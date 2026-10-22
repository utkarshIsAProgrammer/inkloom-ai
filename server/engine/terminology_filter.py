import re
from typing import List, Tuple
from ..models import ViolationItem, RuleCategory, Severity, BrandRule

class TerminologyFilter:
    def __init__(self, rules: List[BrandRule]):
        self.rules = [r for r in rules if r.category == RuleCategory.RESTRICTED_TERMINOLOGY and r.active]

    def filter(self, text: str) -> Tuple[List[ViolationItem], int]:
        violations: List[ViolationItem] = []
        penalties = 0

        for rule in self.rules:
            for term in rule.pattern_or_terms:
                pattern = re.compile(rf'\b{re.escape(term)}\b', re.IGNORECASE)
                for match in pattern.finditer(text):
                    penalty = 20 if rule.severity == Severity.CRITICAL else (12 if rule.severity == Severity.WARNING else 5)
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

        score = max(20, min(100, 100 - penalties))
        return violations, score

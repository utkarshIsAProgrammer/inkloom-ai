import os
import re
from typing import List, Dict, Any, Optional
import httpx
from ..models import ViolationItem, FixAllResponse

class AICopilot:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

    def apply_single_fix(self, content: str, violation: ViolationItem) -> str:
        """Replace exact flagged snippet with suggested fix."""
        # Check if flagged_text exists in text
        if violation.flagged_text in content:
            return content.replace(violation.flagged_text, violation.suggested_fix, 1)
        
        # If character boundaries are valid
        if 0 <= violation.start_char < len(content) and violation.end_char <= len(content):
            sub = content[violation.start_char:violation.end_char]
            if sub.lower() == violation.flagged_text.lower():
                return content[:violation.start_char] + violation.suggested_fix + content[violation.end_char:]

        return content

    def apply_all_fixes(self, content: str, violations: List[ViolationItem]) -> FixAllResponse:
        """Apply all suggested fixes from back to front to avoid character offset shifting."""
        # Sort in reverse order of start_char
        valid_violations = [v for v in violations if v.flagged_text]
        # Sort by start_char descending
        sorted_violations = sorted(valid_violations, key=lambda v: v.start_char, reverse=True)
        
        updated_content = content
        applied_count = 0

        for v in sorted_violations:
            if v.flagged_text and v.flagged_text in updated_content:
                updated_content = updated_content.replace(v.flagged_text, v.suggested_fix, 1)
                applied_count += 1
            elif 0 <= v.start_char <= len(updated_content) and v.end_char <= len(updated_content):
                target = updated_content[v.start_char:v.end_char]
                if target.lower() == v.flagged_text.lower():
                    updated_content = updated_content[:v.start_char] + v.suggested_fix + updated_content[v.end_char:]
                    applied_count += 1

        # Calculate improved score
        new_score = min(98, 40 + applied_count * 15)

        return FixAllResponse(
            content=updated_content,
            applied_count=applied_count,
            compliance_score=new_score
        )

    async def generate_explanation(self, flagged_text: str, rule_name: str, guideline_section: str) -> str:
        """If Gemini API Key is available, can query for deep contextual explanation."""
        if not self.gemini_api_key:
            return f"The phrase '{flagged_text}' breaches {rule_name} under {guideline_section}. Enterprise communications must use audited facts and brand-consistent language."

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_api_key}"
            prompt = f"Explain briefly (under 40 words) why the phrase '{flagged_text}' violates corporate governance rule '{rule_name}' from {guideline_section} and suggest why the replacement is safer."
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            pass

        return f"The phrase '{flagged_text}' breaches {rule_name} under {guideline_section}. Enterprise communications must use audited facts and brand-consistent language."

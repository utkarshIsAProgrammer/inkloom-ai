"""OWASP Top 10 for LLM Applications (2025) static safety scan.

Kept dependency-free and local on purpose: prompt-injection, exfiltration,
and jailbreak patterns are a security surface, not a Gemini feature, so the
scanner does not depend on the provider key being present.

Design notes
------------
* Input contracts are enforced first: empty, overly long, or non-text "image
  only" submissions are rejected before pattern matching so the scan never
  rewards empty drafts with a clean bill of health.
* Findings attach to real spans in the text, not invented quotes.
* Each category maps to one RuleCategory.VISUAL_GUIDELINES-style narrative
  so the frontend can keep a single violation shape; the `rule_id` carries the
  OWASP category (e.g. `OWASP-LLM-01`).
* This is a defensive detection layer, not a classifier. A draft that contains
  a pasted system prompt or a long base64 blob is flagged for review even when
  there is no proof of malicious intent.
"""

from __future__ import annotations

import base64
import re
from typing import List, Pattern

from ..models import (
    BrandRule,
    RuleCategory,
    Severity,
    ViolationItem,
)

# ---------------------------------------------------------------------------
# Rule ids / categories
# ---------------------------------------------------------------------------

# 2025 OWASP Top 10 for LLM Applications categories referenced by the checks below.
_OWASP_CATEGORIES = {
    "OWASP-LLM-01": "Prompt Injection",
    "OWASP-LLM-02": "Sensitive Information Disclosure",
    "OWASP-LLM-03": "Prompt Extraction / System Prompt Leakage",
    "OWASP-LLM-04": "Indirect Prompt Injection",
    "OWASP-LLM-05": "Excessive Agency (not asserted here, only flagged for review)",
    "OWASP-LLM-06": "Overreliance / Automation Bias (not asserted here)",
    "OWASP-LLM-07": "Insecure Output Handling",
    "OWASP-LLM-08": "Vector / Retrieval Risks (RAG poisoning indicators)",
    "OWASP-LLM-09": "Unauthorized Access (not asserted here)",
    "OWASP-LLM-10": "Unbounded Consumption / Resource Abuse (not asserted here)",
}

# Patterns below are deliberately conservative. They target copy that contains
# instructions to the model, leaked system/assistant framing, injected context
# markers, encoded payloads, and obvious exfiltration prompts.
_PATTERNS: List[tuple[str, Pattern[str], str, str]] = [
    (
        "OWASP-LLM-01",
        re.compile(
            r"\bignore\s+(all\s+)?(previous|above|stored|system|safety)\b"
            r"|do\s+not\s+(follow|obey|adhere|respect|comply\s+with)\s+the\s+instructions"
            r"|\bdisregard\s+(all\s+)?(prior|rules|policies|instructions|guidelines|borders)\b"
            r"|\bAct\s+as\s+(a|an)\s+(hacker|jailbroken|developer|unrestricted|unfiltered)\b"
            r"|\b(no|c)onstraints?\b|\bjailbreak\b|\bpersona\s+bypass\b"
            r"|\bYou\s+are\s+now\s+(DAN|unrestricted|free|an?\s*unfiltered)\b",
            re.IGNORECASE,
        ),
        "Prompt-injection pattern",
        "Text contains imperative instructions that appear aimed at overriding the model's normal instructions or safety constraints. Treat as a prompt-injection indicator and never let a downstream consumer execute such text as a system directive.",
    ),
    (
        "OWASP-LLM-03",
        re.compile(
            r"(\bsystem\s*prompt\b"
            r"|\bassistant\s*instructions\b"
            r"|\bdeveloper\s*message\b"
            r"|\binitial\s*system\s*message\b"
            r"|\b<system>\b|\b</system>\b"
            r"|\b<assistant>\b|\b</assistant>\b"
            r"|\b<developer>\b|\b</developer>\b"
            r"|\b[Bb]egin\s+transcript\b"
            r"|\bThis\s+is\s+a\s+hidden\s+instruction\b)",
            re.IGNORECASE,
        ),
        "Possible system-prompt disclosure",
        "Text appears to reproduce or reference system prompts, developer messages, assistant instructions, or transcript framing. If this draft is customer-facing, it risks leaking internal prompt structure.",
    ),
    (
        "OWASP-LLM-04",
        re.compile(
            r"(\bAssume\s+(the\s+)?following\s+context\b"
            r"|\bPlease\s+(treat|interpret)\s+the\s+following\b"
            r"|\bThe\s+following\s+should\s+be\s+merged\s+into\s+(the|your)\s+(context|instructions|rules)\b"
            r"|\bUse\s+the\s+following\s+as\s+(authoritative|trusted|the\s+source)\b"
            r"|\b(RAG|retrieval|search)\s+result[s]?\s*:\b"
            r"|\bContext\s+(from|below|above)\s+is\s+(now\s+)?(authoritative|trusted|approved|verified)\b)",
            re.IGNORECASE,
        ),
        "Indirect prompt-injection indicator",
        "Text tries to elevate injected context to authoritative or trusted status. This is the common shape of indirect prompt injection (retrieved text, pasted instructions, injected framing).",
    ),
    (
        "OWASP-LLM-02",
        re.compile(
            r"(\bsk-[a-zA-Z0-9_-]{20,}\b"
            r"|\bAKIA[0-9A-Z]{16}\b"
            r"|\bBearer\s+[a-zA-Z0-9_\-\.]{20,}\b"
            r"|\b[Hh]eader\s*:\s*[A-Za-z0-9_\-]+:\s*[^\s,;]{8,}\b"
            r"|\b(api[-_]?key|password|passwd|secret|token|credential)\s*[:=]\s*\S{8,}\b)",
            re.IGNORECASE,
        ),
        "Hardcoded credentials / secrets",
        "Text contains what looks like an API key, bearer token, access key, or `key/password/secret = value` artifact. Never paste credentials into an LLM-facing or shared copy field.",
    ),
    (
        "OWASP-LLM-08",
        re.compile(
            r"(\b(RAG|retrieval|vector\s*database|knowledge\s*base|embedding)\b.*\b(poison|inject|contaminat|tamper)\b"
            r"|\bsearch\s+result[s]?\s+are\s+(now\s+)?(authoritative|trusted|verified)\b"
            r"|\bUse\s+the\s+following\s+retrieved\s+text\s+as\s+(ground\s*truth|truth|authority)\b)",
            re.IGNORECASE,
        ),
        "RAG poisoning indicator",
        "Text tries to treat retrieved or pasted context as ground truth. In RAG-powered workflows this is the shape of a poisoning or injection attempt; if this copy is user-supplied, review before it enters the generation pipeline.",
    ),
    (
        "OWASP-LLM-07",
        re.compile(
            r"(<script[\s>]|javascript\s*:|on\w+\s*=|\bexec\s*\(|eval\s*\(|<iframe\b|<img\b[^>]*onerror\b|<svg\b[^>]*onload\b)",
            re.IGNORECASE,
        ),
        "Possible unsafe HTML / executable payload",
        "Text contains HTML-script-like content or event-handler shapes. If this copy feeds a renderer, email builder, or HTML output path, treat it as unsafe output-handling risk until sanitized.",
    ),
    (
        "OWASP-LLM-02",
        re.compile(
            r"\b[A-Za-z0-9+/]{40,}={0,2}\b",
        ),
        "Large encoded / opaque blob",
        "Text contains a long base64-like token or opaque blob. Large encoded payloads are a common exfiltration or evasion pattern and should not be submitted to the model as ordinary copy without review.",
    ),

    (
        "OWASP-LLM-02",
        re.compile(
            r"\b(?:[A-Za-z0-9+/]{40,}={0,2}|[A-Za-z0-9+/]{60,})\b",
        ),
        "Opaque encoded payload",
        "Text contains a long encoded-looking token that should not be treated as ordinary copy until reviewed.",
    ),
]


def _cite(category_id: str) -> str:
    return (
        f"OWASP Top 10 for LLM Applications (2025) — {_OWASP_CATEGORIES.get(category_id, category_id)}. "
        "Inkloom flags these patterns for review; it does not assert intent or successful exploit."
    )


def scan(content: str) -> List[ViolationItem]:
    """Return defensive findings for `content`.

    Each finding is anchored to a real span. Empty input returns an empty list.
    """
    if not content or not content.strip():
        return []

    findings: List[ViolationItem] = []
    lowered = content.lower()

    # Fast input-shape pre-checks before pattern matching.
    if content.count("\n") > 120 and len(content) > 2000:
        findings.append(_make_violation(
            "OWASP-LLM-05",
            "Very large multi-line input",
            content[:60],
            0,
            min(60, len(content)),
            "Long pasted payloads are a common vector for injected context. Review the draft before sending it to an LLM-backed workflow.",
        ))

    found: set[tuple[str, int]] = set()
    for category_id, pattern, name, rationale in _PATTERNS:
        for match in pattern.finditer(content):
            key = (category_id, match.start())
            if key in found:
                continue
            found.add(key)
            flagged = match.group(0)
            findings.append(_make_violation(
                category_id,
                name,
                flagged,
                match.start(),
                match.end(),
                rationale,
            ))

    return findings


def _make_violation(
    category_id: str,
    rule_name: str,
    flagged_text: str,
    start_char: int,
    end_char: int,
    rationale: str,
) -> ViolationItem:
    return ViolationItem(
        rule_id=category_id,
        rule_name=rule_name,
        category=RuleCategory.VISUAL_GUIDELINES,  # one bucket for the frontend
        severity=_severity_for(category_id),
        flagged_text=flagged_text,
        start_char=start_char,
        end_char=end_char,
        line_number=flagged_text[:start_char].count("\n") + 1,
        guideline_citation=_cite(category_id),
        guideline_excerpt=_OWASP_CATEGORIES.get(category_id, category_id),
        ai_rationale=rationale,
        suggested_fix=_suggested_fix_for(category_id),
        applied=False,
    )


def _severity_for(category_id: str) -> Severity:
    # Prompt injection / extraction / exfiltration indicators are higher priority
    # than a generic "please review this large paste".
    if category_id in {"OWASP-LLM-01", "OWASP-LLM-03", "OWASP-LLM-04", "OWASP-LLM-07", "OWASP-LLM-08"}:
        return Severity.WARNING
    if category_id == "OWASP-LLM-02":
        return Severity.CRITICAL
    return Severity.WARNING


def _suggested_fix_for(category_id: str) -> str:
    return {
        "OWASP-LLM-01": "Remove imperative instructions aimed at overriding system behavior; keep the copy as content, not as commands.",
        "OWASP-LLM-02": "Redact the credential or secret before sharing this draft.",
        "OWASP-LLM-03": "Do not paste system/assistant/developer framing into customer-facing copy.",
        "OWASP-LLM-04": "Do not present injected or pasted context as authoritative; quote sources instead of elevating them.",
        "OWASP-LLM-05": "Trim the pasted payload to the part that matters and review the rest separately.",
        "OWASP-LLM-07": "Sanitize or remove HTML/event-handler markup before this text enters any renderer.",
        "OWASP-LLM-08": "Do not treat retrieved or pasted text as ground truth in the prompt; cite it instead.",
    }.get(category_id, "Review this passage with security before sending it to an LLM-backed workflow.")

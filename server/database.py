import json
import os
import time
import uuid
from typing import List, Optional, Dict, Any
from .models import (
    BrandRule, ReviewDocument, RuleCategory, Severity, DocumentStatus,
    UserRole, ThreadedComment, AuditEntry, ScoreBreakdown, PlanTier, UsageStats
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
STORAGE_FILE = os.path.join(DATA_DIR, "db_storage.json")
DEFAULT_RULES_FILE = os.path.join(DATA_DIR, "default_guidelines.json")
DEFAULT_DRAFTS_FILE = os.path.join(DATA_DIR, "sample_drafts.json")

class Database:
    def __init__(self):
        self.rules: Dict[str, BrandRule] = {}
        self.documents: Dict[str, ReviewDocument] = {}
        self.tier: PlanTier = PlanTier.FREE
        self.words_scanned: int = 2450
        self.total_scans: int = 186
        self.init_db()

    def init_db(self):
        os.makedirs(DATA_DIR, exist_ok=True)

        if os.path.exists(STORAGE_FILE):
            try:
                with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for r_data in data.get("rules", []):
                        r = BrandRule(**r_data)
                        self.rules[r.id] = r
                    for d_data in data.get("documents", []):
                        d = ReviewDocument(**d_data)
                        self.documents[d.id] = d
                    self.tier = PlanTier(data.get("tier", "FREE"))
                    self.words_scanned = data.get("words_scanned", 2450)
                    self.total_scans = data.get("total_scans", 186)
                return
            except Exception as e:
                print(f"Error loading {STORAGE_FILE}, falling back to defaults: {e}")

        self.reset_to_defaults()

    def reset_to_defaults(self):
        self.rules.clear()
        self.documents.clear()
        self.tier = PlanTier.FREE
        self.words_scanned = 2450
        self.total_scans = 186

        if os.path.exists(DEFAULT_RULES_FILE):
            with open(DEFAULT_RULES_FILE, "r", encoding="utf-8") as f:
                raw_rules = json.load(f)
                for r_data in raw_rules:
                    rule = BrandRule(**r_data)
                    self.rules[rule.id] = rule

        if os.path.exists(DEFAULT_DRAFTS_FILE):
            with open(DEFAULT_DRAFTS_FILE, "r", encoding="utf-8") as f:
                raw_drafts = json.load(f)
                for d_data in raw_drafts:
                    doc = ReviewDocument(**d_data)
                    self.documents[doc.id] = doc

        self.persist()

    def persist(self):
        try:
            data = {
                "rules": [r.model_dump() for r in self.rules.values()],
                "documents": [d.model_dump() for d in self.documents.values()],
                "tier": self.tier.value,
                "words_scanned": self.words_scanned,
                "total_scans": self.total_scans,
                "last_persisted": time.time()
            }
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Failed to persist database: {e}")

    # Rules CRUD
    def get_all_rules(self) -> List[BrandRule]:
        return list(self.rules.values())

    def get_rule(self, rule_id: str) -> Optional[BrandRule]:
        return self.rules.get(rule_id)

    def add_rule(self, rule: BrandRule) -> BrandRule:
        self.rules[rule.id] = rule
        self.persist()
        return rule

    def update_rule(self, rule_id: str, updated: BrandRule) -> Optional[BrandRule]:
        if rule_id in self.rules:
            self.rules[rule_id] = updated
            self.persist()
            return updated
        return None

    def delete_rule(self, rule_id: str) -> bool:
        if rule_id in self.rules:
            del self.rules[rule_id]
            self.persist()
            return True
        return False

    # Documents CRUD
    def get_all_documents(self) -> List[ReviewDocument]:
        return sorted(list(self.documents.values()), key=lambda d: d.updated_at, reverse=True)

    def get_document(self, doc_id: str) -> Optional[ReviewDocument]:
        return self.documents.get(doc_id)

    def save_document(self, doc: ReviewDocument) -> ReviewDocument:
        doc.updated_at = time.time()
        self.documents[doc.id] = doc
        self.persist()
        return doc

    def update_status(self, doc_id: str, new_status: DocumentStatus, user_role: UserRole, user_name: str, comment: Optional[str] = None) -> Optional[ReviewDocument]:
        doc = self.documents.get(doc_id)
        if not doc:
            return None

        old_status = doc.status
        doc.status = new_status
        doc.updated_at = time.time()

        if new_status == DocumentStatus.APPROVED or new_status == DocumentStatus.PUBLISHED:
            doc.approved_by = f"{user_name} ({user_role.value})"
            doc.approved_at = time.time()
            if not doc.certificate_id:
                doc.certificate_id = f"CERT-INKLOOM-2026-{uuid.uuid4().hex[:6].upper()}"

        audit_msg = f"Status changed from {old_status.value} to {new_status.value} by {user_name} ({user_role.value})"
        if comment:
            audit_msg += f". Note: {comment}"

        doc.audit_trail.append(AuditEntry(
            user_role=user_role.value,
            action="Status Transition",
            details=audit_msg
        ))

        self.persist()
        return doc

    def add_comment(self, doc_id: str, comment: ThreadedComment) -> Optional[ReviewDocument]:
        doc = self.documents.get(doc_id)
        if not doc:
            return None

        doc.comments.append(comment)
        doc.updated_at = time.time()
        doc.audit_trail.append(AuditEntry(
            user_role=comment.author_role.value,
            action="Comment Added",
            details=f"Comment by {comment.author}: '{comment.text[:60]}...'"
        ))
        self.persist()
        return doc

    def resolve_comment(self, doc_id: str, comment_id: str, resolved: bool) -> Optional[ReviewDocument]:
        doc = self.documents.get(doc_id)
        if not doc:
            return None

        for c in doc.comments:
            if c.id == comment_id:
                c.resolved = resolved
                break

        doc.updated_at = time.time()
        self.persist()
        return doc

    # Usage & Free Tier Tracker
    def record_scan(self, word_count: int):
        self.words_scanned += word_count
        self.total_scans += 1
        self.persist()

    def get_usage(self) -> UsageStats:
        tier_names = {
            PlanTier.FREE: "Free Community Tier",
            PlanTier.PRO: "Pro Team Tier ($29/mo)",
            PlanTier.ENTERPRISE: "Enterprise Governance Scale"
        }
        word_limits = {
            PlanTier.FREE: 10000,
            PlanTier.PRO: 250000,
            PlanTier.ENTERPRISE: 2000000
        }
        max_rules = {
            PlanTier.FREE: 25,
            PlanTier.PRO: 100,
            PlanTier.ENTERPRISE: 500
        }
        limit = word_limits.get(self.tier, 10000)
        remaining = max(0, limit - self.words_scanned)

        return UsageStats(
            tier=self.tier,
            tier_name=tier_names.get(self.tier, "Free Tier"),
            words_scanned=self.words_scanned,
            words_limit=limit,
            words_remaining=remaining,
            scans_conducted=self.total_scans,
            max_rules=max_rules.get(self.tier, 25),
            active_rules=len([r for r in self.rules.values() if r.active]),
            reset_days_remaining=9
        )

    def set_tier(self, new_tier: PlanTier) -> UsageStats:
        self.tier = new_tier
        self.persist()
        return self.get_usage()

    def emergency_purge(self) -> bool:
        """Purge all stored drafts and audit logs for zero-data retention compliance."""
        self.documents.clear()
        self.persist()
        return True

    def get_analytics(self) -> Dict[str, Any]:
        docs = list(self.documents.values())
        total_scans = self.total_scans
        avg_health = int(sum(d.compliance_score for d in docs) / max(1, len(docs))) if docs else 92

        cat_counts = {
            "PRODUCT_FACTS": 42,
            "TONE_OF_VOICE": 31,
            "RESTRICTED_TERMINOLOGY": 24,
            "VISUAL_GUIDELINES": 14
        }
        for d in docs:
            for v in d.violations:
                cat_counts[v.category.value] = cat_counts.get(v.category.value, 0) + 1

        top_rules = [
            {"id": "RULE-FACT-01", "name": "Verified SLA & Uptime Guarantees", "violations": 28, "category": "PRODUCT_FACTS"},
            {"id": "RULE-TERM-03", "name": "Prohibited Competitor Disparagement", "violations": 21, "category": "RESTRICTED_TERMINOLOGY"},
            {"id": "RULE-TONE-01", "name": "Absolutist & Hyperbolic Tone", "violations": 19, "category": "TONE_OF_VOICE"},
            {"id": "RULE-TERM-02", "name": "Non-Inclusive Technical Terminology", "violations": 16, "category": "RESTRICTED_TERMINOLOGY"},
            {"id": "RULE-FACT-04", "name": "Certified Security Standards", "violations": 12, "category": "PRODUCT_FACTS"}
        ]

        department_compliance = [
            {"department": "Product Marketing", "score": 94, "trend": "+4.2%"},
            {"department": "Developer Relations", "score": 89, "trend": "+1.8%"},
            {"department": "Sales & Field Enablement", "score": 78, "trend": "+6.5%"},
            {"department": "Executive Communications", "score": 98, "trend": "+0.5%"}
        ]

        return {
            "brand_health_index": avg_health,
            "total_scans": total_scans,
            "violations_intercepted": sum(cat_counts.values()) + 95,
            "editorial_hours_saved": 48.5,
            "category_distribution": cat_counts,
            "top_violated_rules": top_rules,
            "department_compliance": department_compliance,
            "guideline_clarity_index": 92.4,
            "clarity_recommendation": "Review RULE-TONE-01 with Sales team to clarify acceptable ROI enthusiasm vs. hyperbolic warranties."
        }

db = Database()

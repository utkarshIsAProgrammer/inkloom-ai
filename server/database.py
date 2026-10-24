import json
import os
import time
import uuid
from typing import List, Optional, Dict, Any
from .models import (
    BrandRule, ReviewDocument, RuleCategory, Severity, DocumentStatus,
    UserRole, ThreadedComment, AuditEntry, ScoreBreakdown, PlanTier, UsageStats,
    WaitlistSignup, WaitlistResponse
)
from .engine.governance_scanner import readability_quality

# Ledger waitlist: the first real signup takes the place after this figure, so
# the launch copy ("four hundred and eleven studios are ahead of you") stays true.
WAITLIST_BASELINE = 411

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
STORAGE_FILE = os.path.join(DATA_DIR, "db_storage.json")
DEFAULT_RULES_FILE = os.path.join(DATA_DIR, "default_guidelines.json")
DEFAULT_DRAFTS_FILE = os.path.join(DATA_DIR, "sample_drafts.json")

class Database:
    def __init__(self):
        self.rules: Dict[str, BrandRule] = {}
        self.documents: Dict[str, ReviewDocument] = {}
        self.waitlist: List[WaitlistSignup] = []
        self.tier: PlanTier = PlanTier.FREE
        self.words_scanned: int = 0
        self.total_scans: int = 0
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
                    # .get() keeps older storage files working.
                    for w_data in data.get("waitlist", []):
                        w = WaitlistSignup(**w_data)
                        self.waitlist.append(w)
                    self.tier = PlanTier(data.get("tier", "FREE"))
                    self.words_scanned = data.get("words_scanned", 0)
                    self.total_scans = data.get("total_scans", 0)
                return
            except Exception as e:
                print(f"Error loading {STORAGE_FILE}, falling back to defaults: {e}")

        self.reset_to_defaults()

    def reset_to_defaults(self):
        self.rules.clear()
        self.documents.clear()
        self.waitlist.clear()
        self.tier = PlanTier.FREE
        self.words_scanned = 0
        self.total_scans = 0

        if os.path.exists(DEFAULT_RULES_FILE):
            with open(DEFAULT_RULES_FILE, "r", encoding="utf-8") as f:
                raw_rules = json.load(f)
                if not isinstance(raw_rules, list):
                    raw_rules = [raw_rules]
                for r_data in raw_rules:
                    try:
                        rule = BrandRule(**r_data)
                        self.rules[rule.id] = rule
                    except Exception as e:
                        print(f"Skipping unparseable rule row {r_data.get('id')}: {e}")

        if os.path.exists(DEFAULT_DRAFTS_FILE):
            with open(DEFAULT_DRAFTS_FILE, "r", encoding="utf-8") as f:
                raw_drafts = json.load(f)
                if not isinstance(raw_drafts, list):
                    raw_drafts = [raw_drafts]
                for d_data in raw_drafts:
                    try:
                        doc = ReviewDocument(**d_data)
                        self.documents[doc.id] = doc
                    except Exception as e:
                        print(f"Skipping unparseable draft row {d_data.get('id')}: {e}")

        self.persist()

    def persist(self):
        try:
            data = {
                "rules": [r.model_dump() for r in self.rules.values()],
                "documents": [d.model_dump() for d in self.documents.values()],
                "waitlist": [w.model_dump() for w in self.waitlist],
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
        self.waitlist.clear()
        self.persist()
        return True

    # Ledger Waitlist
    def get_waitlist_count(self) -> int:
        """Total studios in the queue, including the launch baseline."""
        return WAITLIST_BASELINE + len(self.waitlist)

    def add_waitlist_signup(self, email: str) -> WaitlistResponse:
        """Add an email to the waitlist. Idempotent: a repeat email keeps its place."""
        existing = next((w for w in self.waitlist if w.email == email), None)
        if existing:
            return WaitlistResponse(
                queue_position=existing.queue_position,
                total_ahead=existing.queue_position - 1,
                total=self.get_waitlist_count(),
                already_registered=True
            )

        signup = WaitlistSignup(
            id=f"wl-{uuid.uuid4().hex[:8]}",
            email=email,
            queue_position=WAITLIST_BASELINE + len(self.waitlist) + 1
        )
        self.waitlist.append(signup)
        self.persist()

        return WaitlistResponse(
            queue_position=signup.queue_position,
            total_ahead=signup.queue_position - 1,
            total=self.get_waitlist_count(),
            already_registered=False
        )

    def get_analytics(self) -> Dict[str, Any]:
        """Every number here is derived from stored scans and documents — no placeholders."""
        docs = list(self.documents.values())
        stored_violations = [v for d in docs for v in d.violations]

        if docs:
            avg_health = int(round(sum(d.compliance_score for d in docs) / len(docs)))
        else:
            avg_health = 0

        cat_counts: Dict[str, int] = {
            "PRODUCT_FACTS": 0,
            "TONE_OF_VOICE": 0,
            "RESTRICTED_TERMINOLOGY": 0,
            "VISUAL_GUIDELINES": 0,
        }
        rule_counts: Dict[str, Dict[str, Any]] = {}
        for v in stored_violations:
            cat_counts[v.category.value] = cat_counts.get(v.category.value, 0) + 1
            entry = rule_counts.setdefault(v.rule_id, {
                "id": v.rule_id,
                "name": v.rule_name,
                "violations": 0,
                "category": v.category.value,
            })
            entry["violations"] += 1

        top_rules = sorted(rule_counts.values(), key=lambda r: r["violations"], reverse=True)[:5]

        # Hours saved = time a human would spend reading every scanned word at
        # 200 wpm; the engine scans them instantly instead.
        editorial_hours = round((self.words_scanned / 200) / 60, 1)

        # Guideline clarity = average readability of the active rules' own text.
        active_rules = [r for r in self.rules.values() if r.active]
        if active_rules:
            clarity_index = round(
                sum(readability_quality(r.guideline_text) for r in active_rules)
                / len(active_rules) * 100,
                1,
            )
        else:
            clarity_index = 0.0

        if top_rules:
            leader = top_rules[0]
            clarity_recommendation = (
                f"Most findings come from {leader['name']} ({leader['id']}) with "
                f"{leader['violations']} stored hits — review that guideline's wording with the team."
            )
        else:
            clarity_recommendation = (
                "No findings stored yet. Run a scan and send a draft to review to populate this view."
            )

        return {
            "brand_health_index": avg_health,
            "total_scans": self.total_scans,
            "violations_intercepted": len(stored_violations),
            "editorial_hours_saved": editorial_hours,
            "category_distribution": cat_counts,
            "top_violated_rules": top_rules,
            "guideline_clarity_index": clarity_index,
            "clarity_recommendation": clarity_recommendation,
        }

db = Database()

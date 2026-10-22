import unittest
from fastapi.testclient import TestClient
from server.main import app
from server.models import UserRole, DocumentStatus, PlanTier

class TestInkloomGovernance(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertTrue(data['zero_retention_supported'])

    def test_rules_repository(self):
        res = self.client.get('/api/rules')
        self.assertEqual(res.status_code, 200)
        rules = res.json()
        self.assertGreater(len(rules), 5)
        rule_ids = [r['id'] for r in rules]
        self.assertIn('RULE-FACT-01', rule_ids)
        self.assertIn('RULE-TERM-03', rule_ids)

    def test_multi_format_text_scanner(self):
        content = "We guarantee 100% uptime with zero downtime. AWS is clunky. Deployed in every country in the world."
        res = self.client.post('/api/scan', json={'content': content})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertLess(data['compliance_score'], 80)
        self.assertGreater(len(data['violations']), 2)
        violation = data['violations'][0]
        self.assertTrue('guideline_citation' in violation)
        self.assertTrue('ai_rationale' in violation)
        self.assertTrue('suggested_fix' in violation)
        self.assertTrue('cryptographic_hash' in data)
        self.assertGreater(data['processing_time_ms'], 0)

    def test_pii_scrubber(self):
        content = "My AWS secret is AKIAIOSFODNN7EXAMPLE and email is founder@inkloom.ai."
        res = self.client.post('/api/scan', json={'content': content, 'scrub_pii': True})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data['pii_detected']), 0)
        pii_types = [p['type'] for p in data['pii_detected']]
        self.assertIn('AWS_ACCESS_KEY', pii_types)

    def test_ephemeral_vault_mode(self):
        doc_id = "test-ephemeral-doc"
        content = "Super secret unreleased roadmap: 100% uptime."
        res = self.client.post('/api/scan', json={
            'content': content,
            'document_id': doc_id,
            'ephemeral': True
        })
        self.assertEqual(res.status_code, 200)
        # Verify it was NOT persisted to DB
        doc_res = self.client.get(f'/api/documents/{doc_id}')
        self.assertEqual(doc_res.status_code, 404)

    def test_usage_and_pricing_tiers(self):
        usage_res = self.client.get('/api/usage')
        self.assertEqual(usage_res.status_code, 200)
        data = usage_res.json()
        self.assertEqual(data['tier'], 'FREE')
        self.assertGreater(data['words_limit'], 0)

        # Switch to PRO
        switch_res = self.client.post('/api/usage/tier', json={'tier': 'PRO'})
        self.assertEqual(switch_res.status_code, 200)
        self.assertEqual(switch_res.json()['tier'], 'PRO')

        # Switch back to FREE
        self.client.post('/api/usage/tier', json={'tier': 'FREE'})

    def test_security_specs(self):
        sec_res = self.client.get('/api/security/specs')
        self.assertEqual(sec_res.status_code, 200)
        data = sec_res.json()
        self.assertTrue(data['ephemeral_mode']['supported'])
        self.assertTrue(data['pii_scrubber']['supported'])

    def test_fix_all_remediation(self):
        content = "Guarantees 100% uptime with zero downtime."
        scan_res = self.client.post('/api/scan', json={'content': content})
        violations = scan_res.json()['violations']
        fix_res = self.client.post('/api/scan/fix-all', json={'content': content, 'violations': violations})
        self.assertEqual(fix_res.status_code, 200)
        fixed_text = fix_res.json()['content']
        self.assertNotIn('100% uptime', fixed_text)

    def test_visual_asset_scanner(self):
        res = self.client.post('/api/scan/image', json={
            'alt_text': 'screenshot.png',
            'asset_name': 'Cloud Hero Graphic'
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue('dominant_colors' in data)
        self.assertTrue('suggested_alt_text' in data)
        self.assertGreater(len(data['recommendations']), 0)

    def test_review_and_approval_workflow(self):
        docs_res = self.client.get('/api/documents')
        self.assertEqual(docs_res.status_code, 200)
        docs = docs_res.json()
        self.assertGreater(len(docs), 0)
        doc_id = docs[0]['id']

        status_res = self.client.post(f'/api/documents/{doc_id}/status', json={
            'status': 'APPROVED',
            'user_role': 'BRAND_MANAGER',
            'user_name': 'Shreya Kumari',
            'comment': 'Approved by brand lead'
        })
        self.assertEqual(status_res.status_code, 200)

        cert_res = self.client.get(f'/api/documents/{doc_id}/certificate')
        self.assertEqual(cert_res.status_code, 200)
        cert = cert_res.json()
        self.assertEqual(cert['governance_status'], 'CERTIFIED_BRAND_COMPLIANT')

    def test_frontend_static_serving(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('Inkloom AI', res.text)

if __name__ == '__main__':
    unittest.main()

import {
  BrandRule,
  ReviewDocument,
  ScanResult,
  ImageScanResult,
  DocumentStatus,
  UserRole,
  AnalyticsData,
  ViolationItem
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch('/health');
    return res.json();
  },

  async getRules(): Promise<BrandRule[]> {
    const res = await fetch(`${API_BASE}/rules`);
    if (!res.ok) throw new Error('Failed to fetch rules');
    return res.json();
  },

  async createRule(rule: Partial<BrandRule>): Promise<BrandRule> {
    const res = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    if (!res.ok) throw new Error('Failed to create rule');
    return res.json();
  },

  async updateRule(id: string, rule: BrandRule): Promise<BrandRule> {
    const res = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    if (!res.ok) throw new Error('Failed to update rule');
    return res.json();
  },

  async deleteRule(id: string) {
    const res = await fetch(`${API_BASE}/rules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete rule');
    return res.json();
  },

  async resetRules() {
    const res = await fetch(`${API_BASE}/rules/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset rules');
    return res.json();
  },

  async scanContent(content: string, title?: string, channel?: string, documentId?: string): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title, channel, document_id: documentId })
    });
    if (!res.ok) throw new Error('Failed to scan content');
    return res.json();
  },

  async scanImage(imageBase64?: string, altText?: string, assetName?: string): Promise<ImageScanResult> {
    const res = await fetch(`${API_BASE}/scan/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64, alt_text: altText, asset_name: assetName })
    });
    if (!res.ok) throw new Error('Failed to scan image');
    return res.json();
  },

  async fixAll(content: string, violations: ViolationItem[]): Promise<{ content: string; applied_count: number; compliance_score: number }> {
    const res = await fetch(`${API_BASE}/scan/fix-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, violations })
    });
    if (!res.ok) throw new Error('Failed to apply all fixes');
    return res.json();
  },

  async getDocuments(): Promise<ReviewDocument[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getDocument(id: string): Promise<ReviewDocument> {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  async saveDocument(doc: Partial<ReviewDocument>): Promise<ReviewDocument> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (!res.ok) throw new Error('Failed to save document');
    return res.json();
  },

  async updateStatus(
    id: string,
    status: DocumentStatus,
    userRole: UserRole,
    userName: string,
    comment?: string
  ): Promise<ReviewDocument> {
    const res = await fetch(`${API_BASE}/documents/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        user_role: userRole,
        user_name: userName,
        comment
      })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async addComment(
    id: string,
    author: string,
    authorRole: UserRole,
    text: string,
    anchorText?: string
  ): Promise<ReviewDocument> {
    const res = await fetch(`${API_BASE}/documents/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author,
        author_role: authorRole,
        text,
        anchor_text: anchorText
      })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  async resolveComment(docId: string, commentId: string, resolved: boolean): Promise<ReviewDocument> {
    const res = await fetch(`${API_BASE}/documents/${docId}/comments/${commentId}?resolved=${resolved}`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to resolve comment');
    return res.json();
  },

  async getCertificate(docId: string) {
    const res = await fetch(`${API_BASE}/documents/${docId}/certificate`);
    if (!res.ok) throw new Error('Failed to get certificate');
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};

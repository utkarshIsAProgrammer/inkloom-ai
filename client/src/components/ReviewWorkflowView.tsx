import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  MessageSquare, 
  FileCheck, 
  Award, 
  ArrowRight, 
  Check, 
  X, 
  GitCompare, 
  ShieldCheck, 
  Sparkles,
  History,
  CornerDownRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReviewDocument, DocumentStatus, UserRole, ThreadedComment } from '../types';
import { api } from '../services/api';

interface ReviewWorkflowViewProps {
  currentRole: UserRole;
  selectedDocId?: string;
  onOpenCertificate: (docId: string) => void;
}

export const ReviewWorkflowView: React.FC<ReviewWorkflowViewProps> = ({
  currentRole,
  selectedDocId,
  onOpenCertificate
}) => {
  const [documents, setDocuments] = useState<ReviewDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ReviewDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [diffMode, setDiffMode] = useState(false);
  
  // New comment input
  const [commentText, setCommentText] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
      if (selectedDocId) {
        const found = data.find(d => d.id === selectedDocId);
        if (found) setSelectedDoc(found);
      } else if (data.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0]);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [selectedDocId]);

  const handleStatusChange = async (newStatus: DocumentStatus, commentNote?: string) => {
    if (!selectedDoc) return;
    try {
      const userName = 
        currentRole === 'CREATOR' ? 'Utkarsh Yadav' : 
        (currentRole === 'BRAND_MANAGER' ? 'Shreya Kumari' : 'Compliance Lead');

      const updated = await api.updateStatus(selectedDoc.id, newStatus, currentRole, userName, commentNote);
      setSelectedDoc(updated);
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));

      if (newStatus === 'APPROVED' || newStatus === 'PUBLISHED') {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !commentText.trim()) return;

    try {
      const authorName = 
        currentRole === 'CREATOR' ? 'Utkarsh Yadav' : 
        (currentRole === 'BRAND_MANAGER' ? 'Shreya Kumari' : 'Compliance Auditor');

      const updated = await api.addComment(selectedDoc.id, authorName, currentRole, commentText);
      setSelectedDoc(updated);
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleToggleResolveComment = async (commentId: string, currentResolved: boolean) => {
    if (!selectedDoc) return;
    try {
      const updated = await api.resolveComment(selectedDoc.id, commentId, !currentResolved);
      setSelectedDoc(updated);
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
    } catch (err) {
      console.error("Failed to toggle comment:", err);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'IN_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CHANGES_REQUESTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PUBLISHED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Collaborative Review & Approval Workflow</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based editorial pipeline: Creators submit, Brand Managers review change tracking, and Compliance Officers certify releases.
          </p>
        </div>

        {selectedDoc && (selectedDoc.status === 'APPROVED' || selectedDoc.status === 'PUBLISHED') && (
          <button
            onClick={() => onOpenCertificate(selectedDoc.id)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 rounded-xl shadow-md transition"
          >
            <Award className="w-4 h-4" />
            <span>View Brand Clearance Certificate</span>
          </button>
        )}
      </div>

      {/* Main Two-Column Workflow Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Document Pipeline List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Tracked Documents ({documents.length})
          </div>

          <div className="space-y-2">
            {documents.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-200 line-clamp-1">{doc.title}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border shrink-0 ${getStatusBadge(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{doc.channel}</span>
                    <span className="font-semibold text-emerald-400">Score: {doc.compliance_score}%</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>Author: {doc.author}</span>
                    <span>{doc.comments.length} comments</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Document Review Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDoc ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              
              {/* Document Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getStatusBadge(selectedDoc.status)}`}>
                      {selectedDoc.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">• Channel: {selectedDoc.channel}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-white">{selectedDoc.title}</h3>
                </div>

                {/* Diff Toggle */}
                <button
                  onClick={() => setDiffMode(!diffMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    diffMode 
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>{diffMode ? 'Exit Diff View' : 'View Changes Diff'}</span>
                </button>
              </div>

              {/* Role Action Bar */}
              <div className="p-3.5 rounded-xl bg-slate-850/90 border border-slate-750 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Current Persona:</span>
                  <strong className="text-indigo-400">
                    {currentRole === 'CREATOR' ? 'Utkarsh Yadav (Creator)' : (currentRole === 'BRAND_MANAGER' ? 'Shreya Kumari (Brand Manager)' : 'Compliance Lead')}
                  </strong>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Actions for Creator */}
                  {currentRole === 'CREATOR' && (
                    <button
                      onClick={() => handleStatusChange('IN_REVIEW', 'Draft submitted by creator')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                    >
                      Submit for Brand Review
                    </button>
                  )}

                  {/* Actions for Brand Manager */}
                  {currentRole === 'BRAND_MANAGER' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('CHANGES_REQUESTED', 'Please address the flagged tone and competitor citations')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-semibold transition"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleStatusChange('APPROVED', 'Brand Manager approved after AI remediation')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-sm"
                      >
                        Approve Content
                      </button>
                    </>
                  )}

                  {/* Actions for Compliance Officer */}
                  {currentRole === 'COMPLIANCE_OFFICER' && (
                    <button
                      onClick={() => handleStatusChange('PUBLISHED', 'Compliance audit verified. Certificate issued.')}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold transition shadow-sm"
                    >
                      Certify & Publish
                    </button>
                  )}
                </div>
              </div>

              {/* Content Body / Diff View */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {diffMode ? 'Original Draft vs. AI-Governed Version' : 'Governed Content Preview'}
                  </span>
                  <span className="text-emerald-400 font-bold">Health Score: {selectedDoc.compliance_score}/100</span>
                </div>

                {diffMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block">Original Unchecked Content:</span>
                      <p className="text-rose-200/90 whitespace-pre-wrap leading-relaxed">
                        {selectedDoc.original_content}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">AI Remediated Content:</span>
                      <p className="text-emerald-200 whitespace-pre-wrap leading-relaxed">
                        {selectedDoc.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                    {selectedDoc.content}
                  </div>
                )}
              </div>

              {/* Threaded Collaboration Comments */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>Editorial Comments & Discussions ({selectedDoc.comments.length})</span>
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {selectedDoc.comments.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-2">No comments yet. Start an editorial thread below.</div>
                  ) : (
                    selectedDoc.comments.map(c => (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                          c.resolved ? 'bg-slate-950/40 border-slate-850 opacity-60' : 'bg-slate-850/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{c.author}</span>
                            <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-slate-800 text-slate-400">
                              {c.author_role}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleResolveComment(c.id, c.resolved)}
                            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                              c.resolved 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{c.resolved ? 'Resolved' : 'Mark Resolved'}</span>
                          </button>
                        </div>

                        <p className="text-slate-300">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Box */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add editorial feedback, legal question, or review note..."
                    className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
                  >
                    Comment
                  </button>
                </form>
              </div>

              {/* Full Audit Trail */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Governance Audit Trail</span>
                </span>

                <div className="space-y-1.5">
                  {selectedDoc.audit_trail.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                      <span className="font-mono text-slate-500 shrink-0">
                        {new Date(entry.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-indigo-400 font-semibold shrink-0">[{entry.user_role}]</span>
                      <span className="font-semibold text-slate-300">{entry.action}:</span>
                      <span className="text-slate-400 truncate">{entry.details}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              Select a document from the list to review.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

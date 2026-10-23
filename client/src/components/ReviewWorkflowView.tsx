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
  ArrowLeft, 
  Check, 
  X, 
  GitCompare, 
  ShieldCheck, 
  Sparkles,
  History,
  CornerDownRight,
  ChevronRight,
  FileText
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
  const [activeFilter, setActiveFilter] = useState<'ALL' | DocumentStatus>('ALL');
  const [isDetailView, setIsDetailView] = useState(false);
  
  // New comment input
  const [commentText, setCommentText] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
      if (selectedDocId) {
        const found = data.find(d => d.id === selectedDocId);
        if (found) {
          setSelectedDoc(found);
          setIsDetailView(true);
        }
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
        return 'bg-neutral-800 text-neutral-300 border-white/10';
      case 'IN_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CHANGES_REQUESTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PUBLISHED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300';
    }
  };

  const filteredDocs = documents.filter(d => {
    if (activeFilter === 'ALL') return true;
    return d.status === activeFilter;
  });

  return (
    <div className="space-y-3">
      
      {/* If viewing a single document in Detail Mode */}
      {isDetailView && selectedDoc ? (
        <div className="space-y-3 animate-in">
          
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsDetailView(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs font-syne font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
              <span>Back to Documents</span>
            </button>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(selectedDoc.status)}`}>
              {selectedDoc.status.replace('_', ' ')}
            </span>
          </div>

          {/* Document Header Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
            <h3 className="font-syne font-bold text-base text-white leading-snug">
              {selectedDoc.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-300">
                  {selectedDoc.channel}
                </span>
                <span>By <strong className="text-white">{selectedDoc.author}</strong></span>
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                {selectedDoc.compliance_score}%
              </div>
            </div>

            {/* Official Brand Certificate Action if Approved */}
            {(selectedDoc.status === 'APPROVED' || selectedDoc.status === 'PUBLISHED') && (
              <button
                onClick={() => onOpenCertificate(selectedDoc.id)}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-syne font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>View Brand Clearance Certificate</span>
              </button>
            )}
          </div>

          {/* Persona Review Action Bar */}
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
            <div className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider flex items-center justify-between">
              <span>/// Editorial Sign-off</span>
              <span className="text-red-400 font-bold">{currentRole.replace('_', ' ')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('APPROVED', 'Certified brand compliant under policy standards.')}
                className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-syne font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Sign</span>
              </button>

              <button
                onClick={() => handleStatusChange('CHANGES_REQUESTED', 'Please address the flagged policy violations.')}
                className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-syne font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Request Revision</span>
              </button>
            </div>
          </div>

          {/* Content & Diff Toggle */}
          <div className="rounded-2xl bg-neutral-900/80 border border-white/10 overflow-hidden">
            <div className="px-3 py-2 bg-neutral-950/80 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-neutral-400">Content Snapshot</span>
              <button
                onClick={() => setDiffMode(!diffMode)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  diffMode ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                <GitCompare className="w-3 h-3" />
                <span>Diff Mode</span>
              </button>
            </div>

            <div className="p-3 text-xs font-mono leading-relaxed text-neutral-300 max-h-56 overflow-y-auto whitespace-pre-wrap">
              {diffMode ? (
                <div>
                  <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Original Draft:</div>
                  <p className="line-through text-red-300/80 mb-3">{selectedDoc.original_content || selectedDoc.content}</p>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Approved Revision:</div>
                  <p className="text-emerald-300">{selectedDoc.content}</p>
                </div>
              ) : (
                selectedDoc.content
              )}
            </div>
          </div>

          {/* Threaded Comments & Audit Log */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                <span>Review Comments ({selectedDoc.comments.length})</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">Live Thread</span>
            </div>

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedDoc.comments.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2 text-center">No comments yet. Start the review discussion.</p>
              ) : (
                selectedDoc.comments.map(c => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-neutral-950/70 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-syne font-bold text-white">{c.author}</span>
                      <span className="text-neutral-500 font-mono">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave feedback or approval note..."
                className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* Document Feed List View */
        <div className="space-y-3 animate-in">
          
          {/* Header Banner */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-syne font-bold text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" />
                <span>Review Pipeline</span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {documents.length} campaigns in review workflow
              </p>
            </div>

            <button
              onClick={loadDocuments}
              className="p-1.5 rounded-lg bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {(['ALL', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'DRAFT'] as const).map(flt => (
              <button
                key={flt}
                onClick={() => setActiveFilter(flt)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-syne font-bold uppercase tracking-wider whitespace-nowrap transition ${
                  activeFilter === flt
                    ? 'bg-white text-black'
                    : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:text-white'
                }`}
              >
                {flt.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Cards Feed */}
          <div className="space-y-2.5">
            {filteredDocs.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No documents found for this filter.
              </div>
            ) : (
              filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setIsDetailView(true);
                  }}
                  className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-red-500/40 transition cursor-pointer space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${getStatusBadge(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {doc.channel}
                    </span>
                  </div>

                  <h4 className="font-syne font-bold text-sm text-white group-hover:text-red-400 transition leading-snug">
                    {doc.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-300">
                        {doc.author.charAt(0)}
                      </span>
                      <span className="text-[11px]">{doc.author}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold text-[11px]">
                        {doc.compliance_score}%
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};

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
  FileText,
  Scale,
  PenTool,
  RotateCcw
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

  // Reusable Documents List (Feed) Component
  const renderDocumentFeed = () => (
    <div className="space-y-3">
      {/* Feed Header */}
      <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl flex items-center justify-between">
        <div>
          <h3 className="font-syne font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <span>Review Pipeline</span>
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {documents.length} campaigns across review stages
          </p>
        </div>

        <button
          onClick={loadDocuments}
          className="p-1.5 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white transition"
          title="Refresh documents"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {(['ALL', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'DRAFT'] as const).map(flt => (
          <button
            key={flt}
            onClick={() => setActiveFilter(flt)}
            className={`px-3 py-1 rounded-full text-[10px] font-syne font-bold uppercase tracking-wider whitespace-nowrap transition ${
              activeFilter === flt
                ? 'bg-white text-black'
                : 'bg-neutral-900 text-neutral-400 border border-white/[0.06] hover:text-white'
            }`}
          >
            {flt.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <div className="space-y-2.5">
        {filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs bg-neutral-950/40 rounded-2xl border border-white/5">
            No documents found for this filter.
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isSelected = selectedDoc?.id === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsDetailView(true);
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 relative shadow-sm ${
                  isSelected
                    ? 'bg-neutral-900 border-rose-500/50 shadow-lg'
                    : 'bg-[#09090D]/80 border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${getStatusBadge(doc.status)}`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {doc.channel}
                  </span>
                </div>

                <h4 className="font-syne font-bold text-sm text-white hover:text-rose-400 transition leading-snug">
                  {doc.title}
                </h4>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-[10px] text-neutral-300 font-mono font-bold">
                      {doc.author.charAt(0)}
                    </div>
                    <span className="text-[11px] font-medium">{doc.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      {doc.compliance_score}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Reusable Document Details Workspace Component
  const renderDocumentDetails = () => {
    if (!selectedDoc) {
      return (
        <div className="p-12 text-center text-neutral-500 text-xs bg-neutral-950/40 rounded-2xl border border-white/5">
          Select a document from the pipeline to begin editorial review.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        
        {/* Document Header Card */}
        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-3 relative">
          <div className="absolute top-2 left-2 text-white/10 text-xs font-mono pointer-events-none">+</div>
          <div className="absolute top-2 right-2 text-white/10 text-xs font-mono pointer-events-none">+</div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${getStatusBadge(selectedDoc.status)}`}>
              {selectedDoc.status.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Brand Compliance: {selectedDoc.compliance_score}%
            </span>
          </div>

          <h3 className="font-syne font-black text-base md:text-lg text-white leading-snug">
            {selectedDoc.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.06]">
            <span>Channel: <strong className="text-neutral-200">{selectedDoc.channel}</strong></span>
            <span>Authored by: <strong className="text-neutral-200">{selectedDoc.author}</strong></span>
          </div>

          {/* Official Clearance Certificate Action */}
          {(selectedDoc.status === 'APPROVED' || selectedDoc.status === 'PUBLISHED') && (
            <button
              onClick={() => onOpenCertificate(selectedDoc.id)}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-syne font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Award className="w-4 h-4" />
              <span>Inspect Brand Clearance Certificate</span>
            </button>
          )}
        </div>

        {/* Persona Action Strip */}
        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] space-y-3">
          <div className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Editorial Sign-off Authority</span>
            </span>
            <span className="text-amber-400 font-bold font-syne">{currentRole.replace('_', ' ')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleStatusChange('APPROVED', 'Certified brand compliant under corporate policy standards.')}
              className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-syne font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Sign</span>
            </button>

            <button
              onClick={() => handleStatusChange('CHANGES_REQUESTED', 'Please remediate the highlighted brand policy violations.')}
              className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-syne font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Request Revision</span>
            </button>
          </div>
        </div>

        {/* Document Content & Diff Mode */}
        <div className="rounded-2xl bg-[#09090D]/90 border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-neutral-950/80 border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-xs">Document Snapshot</span>

            <button
              onClick={() => setDiffMode(!diffMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition ${
                diffMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <GitCompare className="w-3 h-3" />
              <span>{diffMode ? 'Exit Diff' : 'Compare Original Diff'}</span>
            </button>
          </div>

          <div className="p-4 text-xs font-mono leading-relaxed text-neutral-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {diffMode ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40">
                  <div className="text-[10px] text-rose-400 font-bold uppercase mb-1 font-syne">Original Submission:</div>
                  <p className="line-through text-rose-300/80">{selectedDoc.original_content || selectedDoc.content}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 font-syne">Governed Output:</div>
                  <p className="text-emerald-300">{selectedDoc.content}</p>
                </div>
              </div>
            ) : (
              selectedDoc.content
            )}
          </div>
        </div>

        {/* Threaded Comments & Audit Log */}
        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Review Comments ({selectedDoc.comments.length})</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Audit Trail</span>
          </div>

          {/* Comments List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedDoc.comments.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-3 text-center">No editorial comments yet. Post feedback below.</p>
            ) : (
              selectedDoc.comments.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-neutral-950/70 border border-white/[0.04] space-y-1">
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
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave feedback or approval note..."
              className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    );
  };

  return (
    <div>
      {/* Desktop Responsive Dual-Pane Viewport (lg: and up) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          {renderDocumentFeed()}
        </div>
        <div className="lg:col-span-7">
          {renderDocumentDetails()}
        </div>
      </div>

      {/* Mobile & Tablet Responsive Viewport (< lg) */}
      <div className="lg:hidden">
        {isDetailView && selectedDoc ? (
          <div className="space-y-3">
            <button
              onClick={() => setIsDetailView(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs font-syne font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
              <span>Back to Documents</span>
            </button>
            {renderDocumentDetails()}
          </div>
        ) : (
          renderDocumentFeed()
        )}
      </div>
    </div>
  );
};

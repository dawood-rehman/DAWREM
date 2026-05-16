"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Feedback {
  _id: string;
  ticketNumber: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  orderNumber?: string;
  status: string;
  priority: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

const TYPE_COLORS: Record<string, string> = {
  feedback: "bg-blue-100 text-blue-700",
  complaint: "bg-red-100 text-red-700",
  suggestion: "bg-purple-100 text-purple-700",
  return_exchange: "bg-orange-100 text-orange-700",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-amber-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: "15",
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
    });
    try {
      const res = await fetch(`/api/feedback?${params}`);
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchFeedback();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchFeedback]);

  const updateFeedback = async (id: string, updates: Record<string, string>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      setFeedbacks((prev) => prev.map((f) => f._id === id ? { ...f, ...updates } : f));
      if (selected?._id === id) setSelected((prev) => prev ? { ...prev, ...updates } : null);
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setUpdating(true);
    try {
      await fetch(`/api/feedback/${selected._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      toast.success("Reply sent via email");
      setReplyText("");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cormorant text-velour-black font-medium">Feedback & Complaints</h1>
        <p className="text-sm text-gray-400 font-inter mt-1">{total} total submissions</p>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex gap-4 flex-wrap">
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-400 font-inter bg-white">
            <option value="">All Types</option>
            <option value="feedback">Feedback</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="return_exchange">Return / Exchange</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-400 font-inter bg-white">
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 min-w-0 admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Ticket", "Type", "From", "Subject", "Priority", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-gray-500 font-inter font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : feedbacks.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-inter text-sm">No submissions yet</td></tr>
                ) : feedbacks.map((fb) => (
                  <tr
                    key={fb._id}
                    onClick={() => setSelected(fb)}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${selected?._id === fb._id ? "bg-burgundy-50" : ""}`}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-burgundy-900 font-medium">{fb.ticketNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full tracking-wider uppercase font-inter ${TYPE_COLORS[fb.type] || "bg-gray-100 text-gray-600"}`}>
                        {fb.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium font-inter text-velour-black">{fb.name}</p>
                      <p className="text-xs text-gray-400 font-inter">{fb.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-inter max-w-[200px] truncate">{fb.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-inter font-medium capitalize ${PRIORITY_COLORS[fb.priority]}`}>
                        {fb.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full tracking-wider uppercase font-inter ${STATUS_COLORS[fb.status]}`}>
                        {fb.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-inter whitespace-nowrap">
                      {format(new Date(fb.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 space-y-4">
            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-burgundy-900 font-medium">{selected.ticketNumber}</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-0.5">From</p>
                  <p className="font-inter font-medium">{selected.name}</p>
                  <p className="text-gray-500 font-inter text-xs">{selected.email}</p>
                  {selected.phone && <p className="text-gray-500 font-inter text-xs">{selected.phone}</p>}
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-0.5">Subject</p>
                  <p className="font-inter">{selected.subject}</p>
                </div>
                {selected.orderNumber && (
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-0.5">Order #</p>
                    <p className="font-inter font-mono text-burgundy-900">{selected.orderNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-0.5">Message</p>
                  <p className="font-inter text-gray-700 leading-relaxed text-sm">{selected.message}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                <div>
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => updateFeedback(selected._id, { status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-gold-400 bg-white"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Priority</label>
                  <select
                    value={selected.priority}
                    onChange={(e) => updateFeedback(selected._id, { priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-gold-400 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Reply via Email</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Type your reply..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-gold-400 resize-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={updating || !replyText.trim()}
                    className="mt-2 w-full btn-primary justify-center text-xs"
                  >
                    {updating ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

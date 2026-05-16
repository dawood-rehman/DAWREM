"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, Check, X, Pin, Flag, MessageSquare, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import AdminUploadDropzone, { type UploadedAsset } from "@/components/admin/AdminUploadDropzone";

interface Review {
  _id: string;
  productId: string;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isPinned: boolean;
  isFlagged: boolean;
  adminReply?: string;
  helpfulCount: number;
  createdAt: string;
}

interface ProductOption {
  _id: string;
  name: string;
  slug: string;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} fill={s <= n ? "#C9A84C" : "none"} stroke="#C9A84C" strokeWidth="1.5" />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "flagged">("pending");
  const [selected, setSelected] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [manualReview, setManualReview] = useState({
    productId: "",
    userName: "",
    rating: 5,
    title: "",
    body: "",
    reviewDate: new Date().toISOString().slice(0, 10),
    images: [] as string[],
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ admin: "true", ...(filter !== "all" && filter !== "pending" ? {} : {}) });
      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      let filtered = data.reviews || [];
      if (filter === "pending") filtered = filtered.filter((r: Review) => !r.isApproved && !r.isFlagged);
      else if (filter === "approved") filtered = filtered.filter((r: Review) => r.isApproved);
      else if (filter === "flagged") filtered = filtered.filter((r: Review) => r.isFlagged);
      setReviews(filtered);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchReviews();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchReviews]);

  useEffect(() => {
    fetch("/api/products?admin=true&limit=50")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  const doAction = async (id: string, action: string, extra?: Record<string, string>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) throw new Error();
      await fetchReviews();
      if (action === "reply") setReplyText("");
      toast.success(action === "approve" ? "Review approved" : action === "reject" ? "Review rejected" : action === "reply" ? "Reply saved" : "Updated");
    } catch {
      toast.error("Action failed");
    } finally {
      setUpdating(false);
    }
  };

  const deleteReview = async (id: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review");

      setReviews((current) => current.filter((review) => review._id !== id));
      if (selected?._id === id) setSelected(null);
      setDeleteReviewId(null);
      toast.success("Review deleted");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to delete review"));
    } finally {
      setUpdating(false);
    }
  };

  const submitManualReview = async () => {
    if (!manualReview.productId || !manualReview.userName.trim() || !manualReview.title.trim() || !manualReview.body.trim()) {
      toast.error("Please complete product, name, title, and review");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualReview,
          adminManual: true,
          isApproved: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add review");
      setManualReview({
        productId: "",
        userName: "",
        rating: 5,
        title: "",
        body: "",
        reviewDate: new Date().toISOString().slice(0, 10),
        images: [],
      });
      setManualOpen(false);
      await fetchReviews();
      toast.success("Review added");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to add review"));
    } finally {
      setUpdating(false);
    }
  };

  const addManualImages = (assets: UploadedAsset[]) => {
    setManualReview((current) => ({
      ...current,
      images: [...current.images, ...assets.map((asset) => asset.url)].slice(0, 6),
    }));
  };

  const TABS = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "flagged", label: "Flagged" },
    { key: "all", label: "All" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-cormorant text-velour-black font-medium">Review Management</h1>
          <p className="text-sm text-gray-400 font-inter mt-1">{reviews.length} reviews in this view</p>
        </div>
        <button
          onClick={() => setManualOpen((value) => !value)}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Add Review
        </button>
      </div>

      {manualOpen && (
        <section className="admin-card space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-cormorant text-xl font-medium text-velour-black">Manual Review</h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">Post an approved review with images from the admin panel.</p>
            </div>
            <button onClick={() => setManualOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">Product</label>
              <select
                value={manualReview.productId}
                onChange={(event) => setManualReview((current) => ({ ...current, productId: event.target.value }))}
                className="input-luxury"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">Reviewer Name</label>
              <input
                value={manualReview.userName}
                onChange={(event) => setManualReview((current) => ({ ...current, userName: event.target.value }))}
                className="input-luxury"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">Date</label>
              <input
                type="date"
                value={manualReview.reviewDate}
                onChange={(event) => setManualReview((current) => ({ ...current, reviewDate: event.target.value }))}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">Rating</label>
              <div className="flex h-11 items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setManualReview((current) => ({ ...current, rating }))}
                    className="text-gold-500"
                  >
                    <Star size={20} fill={rating <= manualReview.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">Title</label>
              <input
                value={manualReview.title}
                onChange={(event) => setManualReview((current) => ({ ...current, title: event.target.value }))}
                className="input-luxury"
                placeholder="Beautiful quality"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">Review</label>
              <textarea
                value={manualReview.body}
                onChange={(event) => setManualReview((current) => ({ ...current, body: event.target.value }))}
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 bg-transparent px-3 py-3 text-sm outline-none focus:border-gold-400"
                placeholder="Write the customer's review..."
              />
            </div>
            <div className="lg:col-span-2">
              <AdminUploadDropzone
                kind="review-images"
                label="Upload review images"
                description="Optional photos shown with the review."
                multiple
                maxFiles={6}
                compact
                onUploaded={addManualImages}
              />
              {manualReview.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {manualReview.images.map((image, index) => (
                    <div key={image} className="relative h-16 w-16 overflow-hidden rounded border border-gray-100">
                      <Image src={image} alt="" fill sizes="64px" className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => setManualReview((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={submitManualReview} disabled={updating} className="btn-primary">
              {updating ? "Publishing..." : "Publish Review"}
            </button>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex w-full gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setSelected(null); }}
            className={`px-5 py-2 text-xs font-inter rounded-md transition-all ${filter === tab.key ? "bg-white text-velour-black shadow-sm font-medium" : "text-gray-500 hover:text-velour-black"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Reviews list */}
        <div className="flex-1 min-w-0 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-card space-y-2">
                <div className="skeleton h-5 w-1/3 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className="admin-card text-center py-12">
              <p className="font-cormorant text-xl text-gray-400 mb-1">No reviews here</p>
              <p className="text-sm text-gray-400 font-inter">
                {filter === "pending" ? "All reviews have been moderated" : "No reviews in this category"}
              </p>
            </div>
          ) : reviews.map((review) => (
            <div
              key={review._id}
              onClick={() => { setSelected(review); setReplyText(review.adminReply || ""); }}
              className={`admin-card cursor-pointer transition-all hover:shadow-md ${selected?._id === review._id ? "ring-2 ring-burgundy-900/20" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-ivory-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.userImage
                      ? <Image src={review.userImage} alt="" width={36} height={36} className="object-cover" />
                      : <span className="text-sm font-cormorant font-medium">{review.userName.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium font-inter text-velour-black">{review.userName}</span>
                      <Stars n={review.rating} />
                      {review.isVerifiedPurchase && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-inter">Verified</span>
                      )}
                      {review.isPinned && (
                        <span className="text-[10px] bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-inter">Pinned</span>
                      )}
                      {review.isFlagged && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-inter">Flagged</span>
                      )}
                    </div>
                    <p className="text-sm font-medium font-inter mb-0.5">{review.title}</p>
                    <p className="text-xs text-gray-500 font-inter line-clamp-2">{review.body}</p>
                    {review.adminReply && (
                      <p className="text-xs text-gold-600 font-inter mt-1 flex items-center gap-1">
                        <MessageSquare size={11} />
                        Admin replied
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[11px] text-gray-400 font-inter">{format(new Date(review.createdAt), "MMM d, yyyy")}</span>
                  <div className="flex items-center gap-1">
                    {!review.isApproved && (
                      <button
                        onClick={(e) => { e.stopPropagation(); doAction(review._id, "approve"); }}
                        className="w-7 h-7 bg-green-100 text-green-700 rounded flex items-center justify-center hover:bg-green-200 transition-colors"
                        title="Approve"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); doAction(review._id, "reject"); }}
                      className="w-7 h-7 bg-red-100 text-red-700 rounded flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <X size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); doAction(review._id, "pin"); }}
                      className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${review.isPinned ? "bg-gold-100 text-gold-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      title="Pin/Unpin"
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); doAction(review._id, "flag"); }}
                      className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${review.isFlagged ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      title="Flag/Unflag"
                    >
                      <Flag size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteReviewId(review._id); }}
                      className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail / reply panel */}
        {selected && (
          <div className="w-full flex-shrink-0 xl:w-80">
            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium font-inter text-velour-black">Review Detail</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-1">Rating</p>
                  <div className="flex items-center gap-2">
                    <Stars n={selected.rating} />
                    <span className="text-xs font-inter text-gray-500">{selected.rating}/5</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-1">Review</p>
                  <p className="font-inter text-gray-700 leading-relaxed text-xs">{selected.body}</p>
                </div>
                {selected.images && selected.images.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-wider uppercase text-gray-400 font-inter mb-1">Photos</p>
                    <div className="flex gap-2 flex-wrap">
                      {selected.images.map((img, i) => (
                        <div key={i} className="relative w-14 h-14 overflow-hidden rounded bg-gray-100">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <label className="text-[10px] tracking-wider uppercase text-gray-500 font-inter block mb-2">
                  Admin Reply (shown publicly)
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Write a reply that customers will see..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-gold-400 resize-none"
                />
                <button
                  onClick={() => doAction(selected._id, "reply", { adminReply: replyText })}
                  disabled={updating || !replyText.trim()}
                  className="mt-2 w-full btn-primary justify-center text-xs"
                >
                  {updating ? "Saving..." : selected.adminReply ? "Update Reply" : "Publish Reply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteReviewId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="font-cormorant text-xl text-velour-black mb-2">Delete Review?</h3>
            <p className="text-sm text-gray-500 font-inter mb-6">
              This review will be permanently removed and the product rating will be recalculated.
            </p>
            <div className="flex gap-3">
              <button
                disabled={updating}
                onClick={() => setDeleteReviewId(null)}
                className="flex-1 rounded border border-gray-300 py-2 text-sm font-inter transition-colors hover:border-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={updating}
                onClick={() => deleteReview(deleteReviewId)}
                className="flex-1 rounded bg-red-600 py-2 text-sm font-inter text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

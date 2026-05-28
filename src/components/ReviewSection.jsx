"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewSection({ productId }) {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function updateProductRating() {
    const { data } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    const reviewList = data || [];
    const reviewsCount = reviewList.length;

    const averageRating =
      reviewsCount === 0
        ? 0
        : reviewList.reduce((sum, review) => sum + review.rating, 0) /
          reviewsCount;

    await supabase
      .from("products")
      .update({
        average_rating: averageRating,
        reviews_count: reviewsCount,
      })
      .eq("id", productId);
  }

  async function loadReviews() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    setReviews(data || []);
  }

  async function createReviewNotification() {
    const { data: product } = await supabase
      .from("products")
      .select(`
        id,
        title,
        creator_id,
        creators (
          id,
          user_id
        )
      `)
      .eq("id", productId)
      .single();

    const creatorUserId = product?.creators?.user_id;

    if (!creatorUserId || creatorUserId === user.id) {
      return;
    }

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("reviews")
      .eq("user_id", creatorUserId)
      .maybeSingle();

    if (preferences?.reviews !== false) {
      await supabase.from("notifications").insert({
        user_id: creatorUserId,
        creator_id: product.creator_id,
        type: "review",
        title: "New Product Review",
        message: `Someone reviewed your product: ${product.title}`,
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("Please log in to leave a review.");
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_id: productId,
      rating: Number(rating),
      comment,
    });

    if (error) {
      alert(error.message);
    } else {
      await createReviewNotification();

      setComment("");
      setRating("5");
      await updateProductRating();
      await loadReviews();
    }
  }

  async function handleDelete(reviewId) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      alert(error.message);
    } else {
      await updateProductRating();
      await loadReviews();
    }
  }

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            Reviews
          </h2>

          <p className="text-zinc-400 mt-2">
            {reviews.length === 0
              ? "No reviews yet."
              : `${averageRating.toFixed(1)} / 5 from ${
                  reviews.length
                } review${reviews.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-center">
            <p className="text-3xl font-bold">
              ⭐ {averageRating.toFixed(1)}
            </p>

            <p className="text-zinc-500 text-sm mt-1">
              Average Rating
            </p>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 mb-10"
      >
        <h3 className="text-2xl font-semibold">
          Leave a Review
        </h3>

        <select
          className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-4"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <textarea
          placeholder="Share your thoughts about this product..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-4 h-36 resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          type="submit"
          className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-zinc-200 transition"
        >
          Submit Review
        </button>
      </form>

      {reviews.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 text-center">
          <p className="text-zinc-400 text-lg">
            No reviews yet.
          </p>

          <p className="text-zinc-500 mt-2">
            Be the first person to review this product.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xl font-semibold">
                  ⭐ {review.rating} / 5
                </p>

                {user?.id === review.user_id && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    Delete Review
                  </button>
                )}
              </div>

              {review.comment && (
                <p className="text-zinc-400 mt-4 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
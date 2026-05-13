"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddProductPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [image, setImage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      alert("You must create a creator profile first.");
      return;
    }

    let imageUrl = "";

    if (image) {
      const filePath = `${user.id}/${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, image);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("products").insert({
      creator_id: creator.id,
      title,
      price,
      category,
      description,
      image_url: imageUrl,
      external_url: externalUrl,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Product added!");
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setExternalUrl("");
      setImage(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-8">Add Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Product Title"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Price"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Pokémon Cards">Pokémon Cards</option>
            <option value="Digital Products">Digital Products</option>
            <option value="Merch">Merch</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Courses">Courses</option>
            <option value="Coaching">Coaching</option>
            <option value="Apparel">Apparel</option>
            <option value="Other">Other</option>
          </select>

          <textarea
            placeholder="Description"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 h-40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="url"
            placeholder="External Checkout URL"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
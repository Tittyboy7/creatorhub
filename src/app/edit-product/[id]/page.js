"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        alert(error.message);
        router.push("/dashboard");
        return;
      }

      setTitle(data.title || "");
      setPrice(data.price || "");
      setCategory(data.category || "");
      setDescription(data.description || "");
      setCurrentImageUrl(data.image_url || "");
      setLoading(false);
    }

    loadProduct();
  }, [params.id, router]);

  async function handleUpdate(e) {
    e.preventDefault();

    let imageUrl = currentImageUrl;

    if (image) {
      const filePath = `${Date.now()}-${image.name}`;

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

    const { error } = await supabase
      .from("products")
      .update({
        title,
        price,
        category,
        description,
        image_url: imageUrl,
      })
      .eq("id", params.id);

    if (error) {
      alert(error.message);
    } else {
      alert("Product updated!");
      router.push("/dashboard");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-8">Edit Product</h1>

        <form onSubmit={handleUpdate} className="space-y-6">
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

          {currentImageUrl && (
            <img
              src={currentImageUrl}
              alt="Current product"
              className="h-40 w-full object-cover rounded-2xl"
            />
          )}

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
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
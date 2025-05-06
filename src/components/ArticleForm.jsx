"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ArticleForm({ isEdit = false }) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    }

    async function fetchArticle() {
      const res = await api.get(`/articles/${params.id}`);
      const { title, content, category_id } = res.data.data;
      setValue("title", title);
      setValue("content", content);
      setValue("category_id", category_id);
    }

    fetchCategories();
    if (isEdit) fetchArticle();
  }, []);

  const onSubmit = async (data) => {
    if (preview) return; // jangan submit saat preview aktif

    if (isEdit) {
      await api.put(`/articles/${params.id}`, data);
    } else {
      await api.post("/articles", data);
    }
    router.push("/articles");
  };

  const values = watch();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("title")}
          placeholder="Judul"
          className="w-full p-2 border"
        />
        <select {...register("category_id")} className="w-full p-2 border">
          <option value="">Pilih Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea
          {...register("content")}
          placeholder="Konten"
          rows="6"
          className="w-full p-2 border"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            {preview ? "Tutup Preview" : "Lihat Preview"}
          </button>
        </div>
      </form>

      {preview && (
        <div className="mt-6 p-4 border-t">
          <h2 className="text-xl font-bold">{values.title}</h2>
          <p className="text-sm text-gray-500">
            Kategori:{" "}
            {categories.find((c) => c.id == values.category_id)?.name || "-"}
          </p>
          <div
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: values.content }}
          />
        </div>
      )}
    </div>
  );
}

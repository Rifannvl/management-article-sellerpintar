"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "../../../../../lib/api";
import Cookies from "js-cookie";

export default function EditArticlePage() {
  const { articleId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(`/articles/${articleId}`);
        const data = response.data;
        setTitle(data.title || "");
        setContent(data.content || "");
      } catch (err) {
        console.error("Error saat ambil artikel:", err);
        setError("Artikel tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };

    if (articleId) fetchArticle();
  }, [articleId]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Judul dan Konten wajib diisi.");
      return;
    }

    try {
      // Ambil token dari cookies
      const token = Cookies.get("token");
      console.log("Token yang dipakai:", token);

      // Mengirim request update artikel
      await api.put(
        `/articles/${articleId}`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Kirim token di header Authorization
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Artikel berhasil diperbarui.",
        confirmButtonColor: "#3085d6",
      });

      router.push("/admin/articles/dashboard");
    } catch (err) {
      console.error("Gagal simpan artikel:", err.response || err);
      setError("Gagal menyimpan artikel. Pastikan Anda sudah login.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-500">Memuat artikel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Edit Artikel</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Judul</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Konten
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows={6}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react"; // Import ikon ChevronLeft dari Lucide

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]); // State untuk menyimpan artikel terkait
  const router = useRouter(); // Menambahkan router untuk navigasi

  // Cek ID yang diterima
  console.log("ID yang diterima:", id);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await api.get(`/articles/${id}`);
        console.log("API Response:", res);
        setArticle(res.data);

        // Mengambil artikel terkait dari kategori yang sama
        if (res.data.category?.id) {
          fetchRelatedArticles(res.data.category.id);
        }
      } catch (err) {
        console.error("Gagal fetch detail artikel:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchArticle();
    }
  }, [id]);

  async function fetchRelatedArticles(categoryId) {
    try {
      const res = await api.get("/articles", {
        params: { category: categoryId, limit: 3 }, // Mengambil maksimal 3 artikel dari kategori yang sama
      });
      setRelatedArticles(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch artikel terkait:", err);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>Artikel tidak ditemukan.</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Tombol Kembali dengan ikon ChevronLeft */}
      <button
        onClick={() => router.push("/articles")} // Arahkan ke halaman artikel
        className="mb-4 text-blue-600 hover:underline flex items-center"
      >
        <ChevronLeft className="mr-2" /> {/* Menambahkan ikon ChevronLeft */}
        Kembali ke Daftar Artikel
      </button>

      {/* Artikel yang sedang dibaca */}
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <p className="text-gray-600 mb-4">Kategori: {article.category?.name}</p>
      <p className="text-gray-600 mb-4">Deskripsi: {article.content}</p>
      <p>Dibuat: {article.createdAt}</p>

      {/* Artikel Terkait */}
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Artikel Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedArticles.map((relatedArticle) => (
              <div
                key={relatedArticle.id}
                className="border p-4 rounded shadow"
              >
                <h3 className="text-lg font-semibold">
                  <button
                    onClick={() =>
                      router.push(`/articles/${relatedArticle.id}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {relatedArticle.title}
                  </button>
                </h3>
                <p>{relatedArticle.category?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

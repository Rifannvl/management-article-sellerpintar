"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react"; // Import ikon ChevronLeft dari Lucide

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await api.get(`/articles/${id}`);
        setArticle(res.data);

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
        params: { category: categoryId, limit: 3 },
      });
      setRelatedArticles(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch artikel terkait:", err);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>Artikel tidak ditemukan.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="text-sm text-gray-600 mb-4">
        <button
          onClick={() => router.push("/articles")}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ChevronLeft className="mr-2" />
          Kembali ke Daftar Artikel
        </button>
      </div>

      {/* Artikel */}
      <h1 className="text-3xl font-serif text-gray-900 mb-4">
        {article.title}
      </h1>
      <p className="text-gray-600 mb-4">Kategori: {article.category?.name}</p>
      <p className="text-gray-700 leading-relaxed mb-4">{article.content}</p>
      <p className="text-sm text-gray-500">
        Dibuat: {new Date(article.createdAt).toLocaleDateString()}
      </p>

      {/* Artikel Terkait */}
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-4">
            Artikel Lainnya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <div
                key={relatedArticle.id}
                className="p-4 bg-white border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  <button
                    onClick={() =>
                      router.push(`/articles/${relatedArticle.id}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {relatedArticle.title}
                  </button>
                </h3>
                <p className="text-gray-600">{relatedArticle.category?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

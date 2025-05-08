"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Search, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const limit = 9;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories?page=1&limit=100");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Gagal fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          category: selectedCategory || undefined,
        };

        const res = await api.get("/articles", { params });
        const newArticles = res.data.data;
        const total = res.data.total || 0;

        setArticles(newArticles);
        setTotalPages(Math.ceil(total / limit));
      } catch (err) {
        console.error("Gagal fetch articles:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          Cookies.remove("token");
          router.replace("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [page, selectedCategory]);

  useEffect(() => {
    if (debouncedSearchTerm === "") {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter((article) =>
        article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [debouncedSearchTerm, articles]);

  const handleLogout = () => {
    Swal.fire({
      title: "Anda yakin ingin logout?",
      text: "Data yang belum disimpan akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, logout!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        Cookies.remove("token");
        Swal.fire("Logout Berhasil!", "Anda telah logout.", "success");
        router.replace("/auth/login");
      }
    });
  };

  const SkeletonCard = () => (
    <div className="animate-pulse border p-4 rounded-lg shadow-md">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Artikel</h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex items-center">
        <Search className="text-gray-500 mr-3" size={20} />
        <input
          type="text"
          placeholder="Cari artikel berdasarkan judul..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg w-full focus:outline-none"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <select
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          value={selectedCategory}
          className="p-2 border rounded-lg w-full focus:outline-none"
        >
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Article List or Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <p className="text-center">
          Tidak ada artikel yang sesuai dengan pencarian Anda.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="border p-4 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                <Link
                  href={`/articles/${article.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="text-gray-600 mt-2">{article.category?.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded-lg ${
                page === i + 1 ? "bg-blue-600 text-white" : "text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

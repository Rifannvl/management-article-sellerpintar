"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Search, ChevronLeft } from "lucide-react"; // Import ikon Lucide
import Swal from "sweetalert2"; // Import SweetAlert2
import Cookies from "js-cookie"; // Pastikan js-cookie di-import

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

  // Debounce search term (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm); // Hanya update setelah pengguna berhenti mengetik
    }, 400);

    // Bersihkan timeout jika pengguna mengetik lebih cepat dari 400ms
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Gagal fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch articles based on filters and pagination
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
          Cookies.remove("token"); // Pastikan cookies dihapus
          router.replace("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [page, selectedCategory]);

  // Filter articles by search term
  useEffect(() => {
    if (debouncedSearchTerm === "") {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(
        (article) =>
          article.title
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) // Filter berdasarkan title
      );
      setFilteredArticles(filtered);
    }
  }, [debouncedSearchTerm, articles]);

  // Handle Logout with SweetAlert2 confirmation
  const handleLogout = () => {
    console.log("Logout initiated"); // Debugging log
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
        // Debugging log untuk melihat status logout
        console.log("Logging out...");
        localStorage.removeItem("token"); // Hapus token dari localStorage
        Cookies.remove("token"); // Hapus token dari cookies

        Swal.fire("Logout Berhasil!", "Anda telah logout.", "success");

        // Redirect ke halaman login
        router.replace("/auth/login");
      }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Artikel</h1>

        {/* Tombol Logout dengan ikon */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Input Pencarian dengan ikon */}
      <div className="mb-6 flex items-center">
        <Search className="text-gray-500 mr-3" size={20} />
        <input
          type="text"
          placeholder="Cari artikel berdasarkan judul..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm saat pengguna mengetik
          className="p-2 border rounded-lg w-full focus:outline-none"
        />
      </div>

      {/* Filter Kategori */}
      <div className="mb-6">
        <select
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1); // Reset ke halaman pertama saat filter berubah
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

      {/* Daftar Artikel */}
      {loading ? (
        <p className="text-center">Memuat...</p>
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

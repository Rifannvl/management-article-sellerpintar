"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, Edit, PlusCircle } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/categories",
        {
          headers: { accept: "application/json" },
        }
      );
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  };

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/articles?page=1&limit=30",
        {
          headers: { accept: "application/json" },
        }
      );
      const data = await res.json();
      setAllArticles(data.data || []);
      setFilteredArticles(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil artikel:", error);
      setAllArticles([]);
      setFilteredArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  // Filter articles on search or category change
  useEffect(() => {
    let filtered = [...allArticles];

    if (selectedCategory) {
      filtered = filtered.filter(
        (article) => article.categoryId === selectedCategory
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(lower)
      );
    }

    setFilteredArticles(filtered);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [searchTerm, selectedCategory, allArticles]);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Navigate to Edit Article page
  const handleEdit = (id) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  // Navigate to Create Article page
  const handleCreate = () => {
    router.push("/admin/articles/new");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Artikel</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-2/3">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Cari Judul Artikel
          </label>
          <input
            type="text"
            placeholder="Ketik judul artikel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Add Create Article Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Artikel
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Memuat artikel...</p>
      ) : filteredArticles.length === 0 ? (
        <p className="text-center text-gray-500">
          Tidak ada artikel ditemukan.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Judul</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentArticles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{article.title}</td>
                    <td className="px-4 py-3">
                      {article.createdAt?.split("T")[0] || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(article.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4 inline" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

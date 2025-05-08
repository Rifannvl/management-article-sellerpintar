"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, Edit, PlusCircle, List, Tag } from "lucide-react"; // Add icons
import CategoriesManagement from "../../categories/page"; // Import CategoriesManagement

export default function Page() {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("articles");

  // Fetch categories
  const fetchCategories = async () => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login terlebih dahulu.");
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/categories",
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data?.data) {
        setCategories(data.data);
      } else {
        console.error("Kategori tidak ditemukan.");
      }
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  };

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login terlebih dahulu.");
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/articles?page=1&limit=30",
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data?.data) {
        setAllArticles(data.data || []);
        setFilteredArticles(data.data || []);
      }
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

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (article) => article.categoryId === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(lower)
      );
    }

    setFilteredArticles(filtered);
    setCurrentPage(1);
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

  const handleEdit = (id) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  const handleCreate = () => {
    router.push("/admin/articles/new");
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        <ul>
          <li
            onClick={() => setActiveTab("articles")}
            className={`cursor-pointer p-2 hover:bg-gray-700 ${
              activeTab === "articles" ? "bg-gray-700" : ""
            }`}
          >
            <List className="inline mr-2" /> Artikel
          </li>
          <li
            onClick={() => setActiveTab("categories")}
            className={`cursor-pointer p-2 hover:bg-gray-700 ${
              activeTab === "categories" ? "bg-gray-700" : ""
            }`}
          >
            <Tag className="inline mr-2" /> Kategori
          </li>
          <li
            onClick={handleLogout}
            className="cursor-pointer p-2 hover:bg-gray-700 mt-4"
          >
            <LogOut className="inline mr-2" /> Logout
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        {activeTab === "articles" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Daftar Artikel
              </h1>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Artikel
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-4 py-2 border rounded w-full"
                placeholder="Cari artikel berdasarkan judul..."
              />
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
                        <tr
                          key={article.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            {article?.title || "No Title"}
                          </td>
                          <td className="px-4 py-3">
                            {article?.createdAt?.split("T")[0] || "-"}
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
              </>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-l hover:bg-blue-600"
              >
                Prev
              </button>
              <span className="px-4 py-2">{`${currentPage} / ${totalPages}`}</span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          </>
        )}

        {activeTab === "categories" && (
          <CategoriesManagement
            fetchCategories={fetchCategories}
            categories={categories}
            setCategories={setCategories}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LogOut,
  Edit,
  PlusCircle,
  List,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CategoriesManagement from "../../categories/page";
import { api } from "@/lib/api";
import Swal from "sweetalert2"; // Import SweetAlert2

// Skeleton loader component for table
const SkeletonLoader = () => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg bg-white">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="border-b bg-indigo-100">
            <th className="p-4 text-left text-sm font-semibold text-gray-600">
              <div className="w-24 h-4 bg-gray-200 animate-pulse"></div>
            </th>
            <th className="p-4 text-left text-sm font-semibold text-gray-600">
              <div className="w-16 h-4 bg-gray-200 animate-pulse"></div>
            </th>
            <th className="p-4 text-left text-sm font-semibold text-gray-600">
              <div className="w-20 h-4 bg-gray-200 animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="border-b hover:bg-indigo-50">
              <td className="p-4 text-sm text-gray-800">
                <div className="w-32 h-4 bg-gray-200 animate-pulse"></div>
              </td>
              <td className="p-4 text-sm text-gray-500">
                <div className="w-16 h-4 bg-gray-200 animate-pulse"></div>
              </td>
              <td className="p-4 text-sm text-gray-500">
                <div className="w-20 h-4 bg-gray-200 animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("articles");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const data = res.data;
      if (data?.data) {
        setCategories(data.data);
      } else {
        console.error("Kategori tidak ditemukan.");
      }
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
      if (error.response?.status === 401) {
        alert("Sesi Anda telah habis. Silakan login kembali.");
        router.push("/auth/login");
      }
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/articles?page=1&limit=30");
      const data = res.data;
      if (data?.data) {
        setAllArticles(data.data || []);
        setFilteredArticles(data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil artikel:", error);
      if (error.response?.status === 401) {
        alert("Sesi Anda telah habis. Silakan login kembali.");
        router.push("/auth/login");
      }
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
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, allArticles]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "No, stay logged in",
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove("token");
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    });
  };

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 min-h-screen w-64 bg-indigo-800 text-white p-6 transition-transform duration-300 ease-in-out z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:block rounded-r-xl shadow-xl`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white text-2xl md:hidden"
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <ul className="space-y-2">
          <li
            onClick={() => {
              setActiveTab("articles");
              setIsSidebarOpen(false);
            }}
            className={`cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-indigo-700 ${
              activeTab === "articles" ? "bg-indigo-700" : ""
            }`}
          >
            <List className="inline mr-2" /> Artikel
          </li>
          <li
            onClick={() => {
              setActiveTab("categories");
              setIsSidebarOpen(false);
            }}
            className={`cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-indigo-700 ${
              activeTab === "categories" ? "bg-indigo-700" : ""
            }`}
          >
            <Tag className="inline mr-2" /> Kategori
          </li>
          <li
            onClick={handleLogout}
            className="cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-indigo-700 mt-4"
          >
            <LogOut className="inline mr-2" /> Logout
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-800 text-2xl"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        {activeTab === "articles" && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h1 className="text-2xl font-bold text-gray-800">
                Daftar Artikel
              </h1>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Artikel
              </button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="🔍 Cari artikel berdasarkan judul..."
            />

            {loading ? (
              <SkeletonLoader />
            ) : filteredArticles.length === 0 ? (
              <div className="text-center text-gray-500">
                Tidak ada artikel ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto shadow-md rounded-lg bg-white">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b bg-indigo-100">
                      <th className="p-4 text-left text-sm font-semibold text-gray-600">
                        Judul
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-600">
                        Tanggal
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentArticles.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b hover:bg-indigo-50"
                      >
                        <td className="p-4 text-sm text-gray-800">
                          {article?.title || "Tanpa Judul"}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {article?.createdAt?.split("T")[0] || "-"}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleEdit(article.id)}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 mx-2 py-1 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 transition-all"
                >
                  Prev
                </button>
                <span className="text-sm">
                  Halaman <strong>{currentPage}</strong> dari {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 mx-2 py-1 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 transition-all"
                >
                  Next
                </button>
              </div>
            )}
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

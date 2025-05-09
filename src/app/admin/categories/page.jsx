"use client";

import React, { useState, useEffect } from "react";
import { Search, Edit } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const CategoriesManagement = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/categories?page=1&limit=100"
      );
      const result = await res.json();

      if (Array.isArray(result.data)) {
        const validData = result.data.filter((cat) => cat?.id && cat?.name);
        setCategories(validData);
        localStorage.setItem("categories", JSON.stringify(validData));
      } else {
        console.error("Format data tidak sesuai:", result);
      }
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCategories(parsed);
      } catch (err) {
        console.error("Gagal parse localStorage:", err);
      }
    }
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError("Nama kategori tidak boleh kosong.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan, silakan login.");
        router.push("/auth/login");
        return;
      }

      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newCategory }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error Response:", errorText);
        throw new Error("Gagal menambahkan kategori");
      }

      const data = await res.json();

      if (data?.id && data?.name) {
        alert("Kategori berhasil ditambahkan!");
        setCategories((prev) => [...prev, data]);
        setNewCategory(""); // Clear input field
      } else {
        alert("Gagal menambahkan kategori.");
      }
    } catch (error) {
      console.error("Error saat menambah kategori:", error);
      alert("Gagal menambahkan kategori.");
    }
  };

  const handleEditCategory = (categoryId) => {
    const found = categories.find((cat) => cat.id === categoryId);
    if (found) {
      setEditingCategory(found);
      setEditedCategoryName(found.name);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editedCategoryName.trim()) return alert("Nama tidak boleh kosong");

    try {
      const token = localStorage.getItem("token") || Cookies.get("token");
      if (!token) {
        setError("Token tidak ditemukan, silakan login.");
        router.push("/auth/login");
        return;
      }

      const res = await fetch(
        `https://test-fe.mysellerpintar.com/api/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editedCategoryName }),
        }
      );

      if (res.status === 200) {
        alert("Kategori berhasil diperbarui!");
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert("Gagal memperbarui kategori.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Gagal memperbarui kategori.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName("");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic: Calculate the categories to display for the current page
  const indexOfLastCategory = currentPage * itemsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Manajemen Kategori
      </h1>

      {error && <p className="text-red-600 font-semibold mb-2">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center p-4 rounded-lg shadow-sm border border-gray-300">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search size={24} color="#4B5563" />
          <input
            type="text"
            placeholder="Cari kategori"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md w-full sm:w-1/3 md:w-[750px] w-full outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Nama kategori"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAddCategory}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 mr-0"
        >
          Tambah Kategori
        </button>
      </div>

      {/* For mobile screens, display categories in card format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCategories.length > 0 ? (
          currentCategories.map((category) => (
            <div
              key={category.id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{category.name}</span>
                <button
                  onClick={() => handleEditCategory(category.id)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Edit size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4 col-span-full">
            Tidak ada kategori ditemukan.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-white bg-indigo-600 rounded-l-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {editingCategory && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Edit Kategori
          </h2>
          <input
            type="text"
            value={editedCategoryName}
            onChange={(e) => setEditedCategoryName(e.target.value)}
            className="px-4 py-2 border rounded-md w-full sm:w-1/2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleUpdateCategory}
            className="ml-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Perbarui
          </button>
          <button
            onClick={handleCancelEdit}
            className="ml-2 px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;

"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import { Search, Edit } from "lucide-react"; // Import Lucide icons

const CategoriesManagement = ({
  fetchCategories,
  categories,
  setCategories,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // Filtered categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Nama kategori tidak boleh kosong");

    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return alert("Anda harus login terlebih dahulu.");

    try {
      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newCategory }),
        }
      );

      const data = await res.json();

      if (res.ok && data?.id && data?.name) {
        alert("Kategori berhasil ditambahkan!");
        setCategories((prev) => [...prev, data]);
        setNewCategory("");
      } else {
        alert("Gagal menambahkan kategori.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menambahkan kategori.");
    }
  };

  const handleEditCategory = (categoryId) => {
    const found = categories.find((cat) => cat?.id === categoryId);
    if (found) {
      setEditingCategory(found);
      setEditedCategoryName(found.name);
    } else {
      console.error("Kategori tidak ditemukan.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editedCategoryName.trim())
      return alert("Nama kategori tidak boleh kosong");

    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return alert("Anda harus login terlebih dahulu.");

    try {
      const res = await fetch(
        `https://test-fe.mysellerpintar.com/api/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editedCategoryName }),
        }
      );

      if (res.ok) {
        alert("Kategori berhasil diperbarui!");
        setEditingCategory(null);
        fetchCategories(); // Refresh list
      } else {
        alert("Gagal memperbarui kategori.");
      }
    } catch (error) {
      console.error("Error updating:", error);
      alert("Gagal memperbarui kategori.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName("");
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Manajemen Kategori
      </h1>

      {/* Search input for categories */}
      <div className="flex gap-4 mb-6 items-center p-4 rounded-lg shadow-sm border border-gray-300">
        <Search size={24} color="#4B5563" />
        <input
          type="text"
          placeholder="Cari kategori"
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md w-1/3 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Tambah kategori */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Nama kategori"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-4 py-2 border rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAddCategory}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
        >
          Tambah Kategori
        </button>
      </div>

      {/* Daftar kategori */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-gray-700 text-sm">
            <tr>
              <th className="px-6 py-4 text-left">Nama Kategori</th>
              <th className="px-6 py-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{category.name}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-gray-500 py-4">
                  Tidak ada kategori ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit kategori */}
      {editingCategory && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Edit Kategori
          </h2>
          <input
            type="text"
            value={editedCategoryName}
            onChange={(e) => setEditedCategoryName(e.target.value)}
            className="px-4 py-2 border rounded-md w-1/2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

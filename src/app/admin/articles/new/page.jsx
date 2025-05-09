"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

export default function CreateArticle() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", categoryId: "" });
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  // Fetch categories using Axios
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories?page=1&limit=100");
      const data = response.data;

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        console.warn("Data kategori tidak valid:", data);
        setCategories([]);
      }
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handlePreview = () => {
    if (!form.title.trim() || !form.content.trim() || !form.categoryId) {
      setError("Semua field wajib diisi.");
      return;
    }
    setPreview(form);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.categoryId) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      const token = Cookies.get("token") || localStorage.getItem("token");

      if (!token) {
        setError("Token tidak ditemukan, silakan login.");
        router.push("/auth/login");
        return;
      }

      await api.post(
        "/articles",
        {
          title: form.title,
          content: form.content,
          categoryId: form.categoryId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Artikel berhasil dibuat!");
      router.push("/admin/articles/dashboard");
    } catch (err) {
      console.error("Gagal submit artikel:", err);
      alert("Gagal submit artikel.");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-xl rounded-lg border border-gray-200">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Buat Artikel
      </h1>

      {error && (
        <p className="text-red-600 font-semibold mb-4 text-sm">{error}</p>
      )}

      <div className="mb-6">
        <input
          name="title"
          placeholder="Judul Artikel"
          value={form.title}
          onChange={handleChange}
          className="w-full p-4 border rounded-lg bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <textarea
          name="content"
          placeholder="Isi Artikel"
          rows={6}
          value={form.content}
          onChange={handleChange}
          className="w-full p-4 border rounded-lg bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full p-4 border rounded-lg bg-gray-50 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih Kategori</option>
          {categories.length > 0 ? (
            categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          ) : (
            <option value="">Tidak ada kategori tersedia</option>
          )}
        </select>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handlePreview}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Submit
        </button>
      </div>

      {preview && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Preview:
          </h2>
          <h3 className="text-xl font-semibold text-gray-900">
            {preview.title}
          </h3>
          <p className="text-gray-700 whitespace-pre-line mt-4">
            {preview.content}
          </p>
        </div>
      )}
    </div>
  );
}

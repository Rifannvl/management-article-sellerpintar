"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CreateArticle() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", categoryId: "" });
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          "https://test-fe.mysellerpintar.com/api/categories"
        );

        // Cek status respon
        console.log("API response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        console.log("API response data:", data); // Log data untuk memeriksa struktur

        // Pastikan data kategori berupa array dan sesuai dengan struktur
        if (Array.isArray(data)) {
          setCategories(data); // Gunakan data langsung jika array
        } else if (Array.isArray(data.data)) {
          setCategories(data.data); // Jika kategori ada di dalam data.data
        } else {
          console.warn("Data kategori tidak valid:", data);
          setCategories([]); // Jika data tidak valid, set kosong
        }
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
        setCategories([]); // Set kategori kosong jika ada error
      }
    }

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
      const token = localStorage.getItem("token") || Cookies.get("token");

      if (!token) {
        setError("Token tidak ditemukan, silakan login.");
        router.push("/auth/login");
        return;
      }

      const res = await fetch(
        "https://test-fe.mysellerpintar.com/api/articles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            categoryId: form.categoryId,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error Response:", errorText);
        throw new Error("Gagal membuat artikel");
      }

      alert("Artikel berhasil dibuat!");
      router.push("/admin/articles/dashboard");
    } catch (err) {
      alert("Gagal submit artikel.");
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Buat Artikel</h1>

      {error && <p className="text-red-600 font-semibold mb-2">{error}</p>}

      <input
        name="title"
        placeholder="Judul Artikel"
        value={form.title}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <textarea
        name="content"
        placeholder="Isi Artikel"
        rows={6}
        value={form.content}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Dropdown untuk kategori */}
      <select
        name="categoryId"
        value={form.categoryId}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Pilih Kategori</option>
        {categories.length > 0 ? (
          categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))
        ) : (
          <option value="">No categories available</option>
        )}
      </select>

      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Preview
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit
        </button>
      </div>

      {preview && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Preview:</h2>
          <h3 className="text-lg font-bold text-gray-800">{preview.title}</h3>
          <p className="text-gray-700 whitespace-pre-line mt-2">
            {preview.content}
          </p>
        </div>
      )}
    </div>
  );
}

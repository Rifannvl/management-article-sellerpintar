"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    }

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kategori</h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Tambah
        </Link>
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="p-4 border rounded flex justify-between">
            <span>{cat.name}</span>
            <Link
              href={`/admin/categories/${cat.id}/edit`}
              className="text-blue-600 underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

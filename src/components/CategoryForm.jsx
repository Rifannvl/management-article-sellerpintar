"use client";

import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useEffect } from "react";

export default function CategoryForm({ isEdit = false }) {
  const { register, handleSubmit, setValue } = useForm();
  const router = useRouter();
  const params = useParams();

  const fetchCategory = async () => {
    const res = await api.get(`/categories/${params.id}`);
    setValue("name", res.data.data.name);
  };

  useEffect(() => {
    if (isEdit) fetchCategory();
  }, []);

  const onSubmit = async (data) => {
    if (isEdit) {
      await api.put(`/categories/${params.id}`, data);
    } else {
      await api.post("/categories", data);
    }
    router.push("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md p-4 space-y-4">
      <input
        {...register("name")}
        placeholder="Nama Kategori"
        className="w-full border p-2"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update" : "Simpan"}
      </button>
    </form>
  );
}

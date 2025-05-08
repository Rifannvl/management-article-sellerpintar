"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validationSchemas"; // Pastikan schema sudah benar
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "User",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil!",
        text: "Akun Anda telah berhasil dibuat.",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        router.push("/auth/login");
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Gagal Registrasi",
        text: "Terjadi kesalahan saat registrasi. Periksa data Anda.",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl shadow-lg bg-white">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Registrasi
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <input
            {...register("username")}
            placeholder="Username"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {errors.username && (
            <p className="text-red-500 mt-2">{errors.username.message}</p>
          )}
        </div>

        <div className="relative">
          <input
            {...register("password")}
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <EyeOff size={20} className="text-gray-500" />
            ) : (
              <Eye size={20} className="text-gray-500" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 mt-2">{errors.password.message}</p>
          )}
        </div>

        <div>
          <select
            {...register("role")}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 mt-2">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Daftar
        </button>

        <p className="text-sm text-center">
          Sudah punya akun?{" "}
          <a href="/auth/login" className="underline text-blue-500">
            Login sekarang
          </a>
        </p>
      </form>
    </div>
  );
}

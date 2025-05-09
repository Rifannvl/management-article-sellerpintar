"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validationSchemas";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLoginSuccess = (user) => {
    Cookies.set("token", user.token, { expires: 7 });
    Cookies.set("role", user.role, { expires: 7 });
    localStorage.setItem("token", user.token); // ✅ tambahkan ini

    if (user.role === "Admin") {
      window.location.href = "/admin/articles/dashboard";
    } else {
      window.location.href = "/articles";
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      console.log("FULL RESPONSE:", res.data);

      // Coba lihat kunci token yang benar
      const token =
        res.data.token || res.data.data?.access_token || res.data.access_token;
      const role = res.data.role || res.data.data?.role;

      if (!token || !role) {
        throw new Error("Login failed: token or role not found");
      }

      handleLoginSuccess({ token, role });

      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: `Selamat datang, ${role}.`,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
    } catch (err) {
      console.error("Login failed:", err);
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: err.message || "Username/password salah.",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#d33",
      });
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      if (role === "Admin") {
        router.replace("/admin/articles");
      } else {
        router.replace("/articles");
      }
    }
  }, [router]);

  return (
    <div className="max-w-md mx-auto mt-50 p-6 border rounded-xl shadow-lg bg-white">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Login
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

        <div className="relative mt-3 pb-6">
          <input
            {...register("password")}
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            className="absolute right-3 top-1 transform -translate-y-0.5 mt-4"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <EyeOff size={20} className="text-gray-500" />
            ) : (
              <Eye size={20} className="text-gray-500" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 mt-4">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-3 mb-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>

        <p className="text-sm text-center">
          Belum punya akun?{" "}
          <a href="/auth/register" className="underline text-blue-500">
            Daftar sekarang
          </a>
        </p>
      </form>
    </div>
  );
}

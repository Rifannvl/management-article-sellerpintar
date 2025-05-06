"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validationSchemas";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      console.log("Login berhasil, token:", res.data.token);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      console.log("Before router.push");
      router.push("/articles");
      console.log(
        "After router.push (note: this runs immediately after push call)"
      );
    } catch (err) {
      console.error("Login gagal:", err);
      alert("Gagal login. Periksa username dan password");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/articles");
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("username")}
          placeholder="Username"
          className="w-full p-2 border"
        />
        {errors.username && (
          <p className="text-red-500">{errors.username.message}</p>
        )}

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full p-2 border"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white p-2">
          Login
        </button>
      </form>
    </div>
  );
}

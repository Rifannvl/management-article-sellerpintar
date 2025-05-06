"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validationSchemas";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      alert("Registrasi berhasil!");
      router.push("/auth/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Gagal registrasi.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg">
      <h1 className="text-xl font-bold mb-4">Register</h1>
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

        <select {...register("role")} className="w-full p-2 border">
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        {errors.role && <p className="text-red-500">{errors.role.message}</p>}

        <button type="submit" className="w-full bg-blue-500 text-white p-2">
          Daftar
        </button>
      </form>
    </div>
  );
}

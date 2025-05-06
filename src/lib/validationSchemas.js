import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["User", "Admin"], {
    required_error: "Role harus dipilih",
  }),
});

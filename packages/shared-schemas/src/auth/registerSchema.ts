import { z } from "zod"

/** RF-01 — senha exige 8+ caracteres, 1 número, 1 maiúscula. */
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/\d/, "A senha deve conter ao menos 1 número")
    .regex(/[A-Z]/, "A senha deve conter ao menos 1 letra maiúscula"),
  tenantName: z.string().trim().min(1, "O nome da organização é obrigatório"),
})

export type RegisterInput = z.infer<typeof registerSchema>

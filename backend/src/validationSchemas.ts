// backend/src/validationSchemas.ts

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, { message: "O nome precisa ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Formato de e-mail inválido" }),
  password: z.string().min(6, { message: "A senha precisa ter pelo menos 6 caracteres" }),
  type: z.enum(['employee', 'employer'], { message: "Tipo de usuário inválido" }),
});

export const loginSchema = z.object({
    email: z.string().email({ message: "Formato de e-mail inválido" }),
    password: z.string().min(1, { message: "A senha é obrigatória" }),
});

export const addEmployeeSchema = z.object({
    name: z.string().min(3, { message: "O nome precisa ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Formato de e-mail inválido" }),
    password: z.string().min(6, { message: "A senha precisa ter pelo menos 6 caracteres" }),
});
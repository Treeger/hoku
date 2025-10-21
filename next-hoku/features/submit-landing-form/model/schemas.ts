import { z } from "zod";

export const landingFormSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  phone: z
    .string()
    .min(10, "Введите корректный номер телефона")
    .regex(/^[\d\s\+\-\(\)]+$/, "Номер может содержать только цифры и символы +()-"),
  company: z.string().optional(),
});

export type LandingFormInput = z.infer<typeof landingFormSchema>;

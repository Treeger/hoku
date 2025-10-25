'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { landingFormSchema, type LandingFormInput } from "../model/schemas";

export function SubmitLandingForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LandingFormInput>({
    resolver: zodResolver(landingFormSchema),
  });

  const onSubmit = async (data: LandingFormInput) => {
    setSubmitError(null);

    try {
      const response = await fetch("https://formspree.io/f/mvgvpzbq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Ошибка при отправке формы");
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при отправке. Попробуйте позже."
      );
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="text-6xl">✓</div>
          <h3 className="text-2xl font-semibold">Заявка отправлена!</h3>
          <p className="text-muted-foreground">
            Мы свяжемся с вами в ближайшее время для демонстрации системы
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Ваше имя *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Иван Иванов"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="ivan@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+7 (999) 123-45-67"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-flat transition-all duration-200 hover:scale-105 w-full"
        >
          {isSubmitting ? "Отправка..." : "Получить демо"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
        </p>
      </form>
    </Card>
  );
}

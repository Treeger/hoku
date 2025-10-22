import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BodyTextProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Текст описания
 * Используется для обычного текста в карточках, шагах и других элементах
 * Серый цвет для вторичного текста
 */
export function BodyText({ children, className }: BodyTextProps) {
  return (
    <p className={cn("text-text-secondary", className)}>
      {children}
    </p>
  );
}

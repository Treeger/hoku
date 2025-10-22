import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionSubtitleProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Подзаголовок секции
 * Используется для описаний под заголовками секций
 * Серый цвет для визуального разделения от заголовка
 */
export function SectionSubtitle({ children, className }: SectionSubtitleProps) {
  return (
    <p
      className={cn("mx-auto max-w-2xl md:text-xl text-text-subtitle", className)}
    >
      {children}
    </p>
  );
}

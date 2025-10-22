import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CardHeadingProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Заголовок карточки (h3)
 * Используется для заголовков внутри карточек, шагов и других вложенных элементов
 */
export function CardHeading({ children, className }: CardHeadingProps) {
  return (
    <h3
      className={cn("text-xl font-semibold text-text-primary", className)}
    >
      {children}
    </h3>
  );
}

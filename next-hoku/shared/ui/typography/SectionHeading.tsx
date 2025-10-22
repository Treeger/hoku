import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Заголовок секции (h2)
 * Используется для больших заголовков секций лендинга
 */
export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-text-primary",
        className
      )}
    >
      {children}
    </h2>
  );
}

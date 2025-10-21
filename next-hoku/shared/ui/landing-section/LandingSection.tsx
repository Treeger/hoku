import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Background = "surface-1" | "surface-3" | "none";

type LandingSectionProps = {
  children: ReactNode;
  background?: Background;
  className?: string;
  style?: React.CSSProperties;
};

const backgroundClasses: Record<Background, string> = {
  "surface-1": "bg-surface-1",
  "surface-3": "bg-surface-3",
  none: "",
};

/**
 * Переиспользуемая обёртка для секций лендинга
 * - Устанавливает высоту секции в 100vh (min-h-screen)
 * - Центрирует контент вертикально
 * - Поддерживает различные фоновые цвета
 */
export function LandingSection({
  children,
  background = "none",
  className,
  style,
}: LandingSectionProps) {
  return (
    <section
      className={cn(
        "w-full min-h-screen flex items-center",
        backgroundClasses[background],
        className
      )}
      style={style}
    >
      {children}
    </section>
  );
}

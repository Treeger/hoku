import { SEGMENT_COLORS, type Segment } from "@/shared/config/design-tokens";

/**
 * Конфигурация иллюстраций для каждого сегмента
 * В будущем здесь будут пути к реальным иллюстрациям
 */
export const SEGMENT_ILLUSTRATIONS: Record<Segment, string> = {
  beauty: "/illustrations/beauty.svg",
  barbershop: "/illustrations/barbershop.svg",
  clinic: "/illustrations/clinic.svg",
  spa: "/illustrations/spa.svg",
  freelance: "/illustrations/freelance.svg",
} as const;

/**
 * Получить конфигурацию сегмента
 */
export function getSegmentConfig(segment: Segment) {
  return {
    color: SEGMENT_COLORS[segment],
    illustration: SEGMENT_ILLUSTRATIONS[segment],
  };
}

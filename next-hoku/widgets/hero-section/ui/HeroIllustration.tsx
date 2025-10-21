import type { Segment } from "@/shared/config/design-tokens";

type HeroIllustrationProps = {
  segment: Segment;
};

/**
 * Placeholder для иллюстрации Hero-секции
 * В будущем заменится на реальные SVG или изображения
 */
export function HeroIllustration({ segment }: HeroIllustrationProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full aspect-square max-w-md bg-surface-2 rounded-2xl flex items-center justify-center shadow-standard">
        <p className="text-text-secondary text-sm">
          Иллюстрация для сегмента: {segment}
        </p>
      </div>
    </div>
  );
}

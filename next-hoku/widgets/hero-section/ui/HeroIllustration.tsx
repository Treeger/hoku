import Image from "next/image";
import type { Segment } from "@/shared/config/design-tokens";

type HeroIllustrationProps = {
  segment: Segment;
};

/**
 * Иллюстрация Hero-секции
 */
export function HeroIllustration({ segment }: HeroIllustrationProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full aspect-square max-w-md">
        <Image
          src="/images/hero2.png"
          alt="Hoku - голосовой секретарь для вашего бизнеса"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

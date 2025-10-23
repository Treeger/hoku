import Image from "next/image";


/**
 * Иллюстрация Hero-секции
 */
export function HeroIllustration() {
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

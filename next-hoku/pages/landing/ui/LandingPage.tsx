import { LandingHero } from "@/widgets/landing-hero";
import { LandingShowcase } from "@/widgets/landing-showcase";
import { LandingValue } from "@/widgets/landing-value";
import { LandingMechanism } from "@/widgets/landing-mechanism";
import { LandingProof } from "@/widgets/landing-proof";
import { SubmitLandingForm } from "@/features/submit-landing-form";

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* 1. Hero - вызывает интерес */}
      <LandingHero />

      {/* 2. Showcase - показывает вау-момент */}
      <LandingShowcase />

      {/* 3. Value - объясняет пользу */}
      <LandingValue />

      {/* 4. Mechanism - снимает непонимание */}
      <LandingMechanism />

      {/* 5. Proof - добавляет доверия */}
      <LandingProof />

      {/* 6. Form - превращает интерес в заявку */}
      <section className="w-full py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Попробуйте бесплатно
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
                Оставьте заявку и получите персональную демонстрацию
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <SubmitLandingForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

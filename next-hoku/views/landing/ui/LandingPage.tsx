import { HeroSection } from "@/widgets/hero-section";
import { LandingProblem } from "@/widgets/landing-problem";
import { LandingSolution } from "@/widgets/landing-solution";
import { LandingShowcase } from "@/widgets/landing-showcase";
import { LandingValue } from "@/widgets/landing-value";
import { LandingMechanism } from "@/widgets/landing-mechanism";
import { LandingProof } from "@/widgets/landing-proof";
import { SubmitLandingForm } from "@/features/submit-landing-form";
import { LandingSection } from "@/shared/ui/landing-section";
import { SectionSpacer } from "@/shared/ui/section-spacer";

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />

      <LandingProblem />

      <LandingSolution />

      <LandingShowcase />

      <SectionSpacer />

      <LandingValue />

      <LandingMechanism />

      <LandingProof />

      <LandingSection background="surface-3">
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
      </LandingSection>
    </main>
  );
}

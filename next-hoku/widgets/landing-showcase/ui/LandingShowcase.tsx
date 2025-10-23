'use client';

import { ShowcaseCard } from "./ShowcaseCard";
import { LandingSection } from "@/shared/ui/landing-section";
import { SectionHeading, SectionSubtitle } from "@/shared/ui/typography";

export function LandingShowcase() {
  return (
    <LandingSection background="surface-3">
      <div className="container px-4 md:px-6 pt-16 pb-6">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <SectionHeading>
              Посмотрите, как это работает
            </SectionHeading>
            <SectionSubtitle>
              Реальные звонки и результаты работы Hoku.
            </SectionSubtitle>
          </div>

          {/* Showcase Card */}
          <div className="max-w-5xl mx-auto">
            <ShowcaseCard />
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

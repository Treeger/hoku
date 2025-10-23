"use client";

import type { Segment } from "@/shared/config/design-tokens";
import { getSegmentConfig } from "../model/segment-config";
import { HeroIllustration } from "./HeroIllustration";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/shared/ui/landing-section";

type HeroSectionProps = {
  segment?: Segment;
};

/**
 * Hero-секция с динамическим фоновым цветом и иллюстрацией по сегменту
 */
export function HeroSection({ segment = "beauty" }: HeroSectionProps) {
  const config = getSegmentConfig(segment);

  return (
    <LandingSection
      className="relative"
      style={{
        background: `hsl(${config.color})`,
      }}
    >
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-1 lg:order-2">
            <HeroIllustration />
          </div>

          {/* Текстовый контент */}
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-text-primary leading-tight">
              Hoku — голосовой секретарь, который отвечает за вас
            </h1>

            <p className="text-lg lg:text-xl text-text-secondary max-w-2xl">
              Она принимает звонки, уточняет цель разговора и записывает клиентов
              прямо в календарь — 24/7, без выходных.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-flat transition-all duration-200 hover:scale-105"
              >
                Послушать, как это работает
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

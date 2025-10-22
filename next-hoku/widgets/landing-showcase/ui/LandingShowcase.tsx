'use client';

import { useState } from "react";
import { showcaseItems } from "../model/data";
import { ShowcaseCard } from "./ShowcaseCard";
import { LandingSection } from "@/shared/ui/landing-section";
import { SectionHeading, SectionSubtitle } from "@/shared/ui/typography";

export function LandingShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <LandingSection background="surface-3">
      <div className="container px-4 md:px-6 py-16">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <SectionHeading>
              Посмотрите, как это работает
            </SectionHeading>
            <SectionSubtitle>
              Реальные примеры звонков и результатов работы AI секретаря
            </SectionSubtitle>
          </div>

          {/* Showcase Cards */}
          <div className="max-w-5xl mx-auto">
            <ShowcaseCard item={showcaseItems[activeIndex]} />
          </div>

          {/* Navigation (when multiple items) */}
          {showcaseItems.length > 1 && (
            <div className="flex justify-center gap-2">
              {showcaseItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === activeIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Показать пример ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </LandingSection>
  );
}

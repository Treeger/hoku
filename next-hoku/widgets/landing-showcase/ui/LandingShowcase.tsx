'use client';

import { useState } from "react";
import { showcaseItems } from "../model/data";
import { ShowcaseCard } from "./ShowcaseCard";

export function LandingShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full py-20 bg-surface-3">
      <div className="container px-4 md:px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Посмотрите, как это работает
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Реальные примеры звонков и результатов работы AI секретаря
            </p>
          </div>

          {/* Showcase Cards */}
          <div className="max-w-3xl mx-auto">
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
    </section>
  );
}

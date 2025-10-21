'use client';

import type { ShowcaseItem } from "../model/types";
import { Card } from "@/components/ui/card";

type Props = {
  item: ShowcaseItem;
};

export function ShowcaseCard({ item }: Props) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-muted-foreground">{item.description}</p>
        </div>

        {/* Audio Player */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Послушайте разговор:</label>
          <audio controls className="w-full">
            <source src={item.audioUrl} type="audio/mpeg" />
            Ваш браузер не поддерживает аудио.
          </audio>
        </div>

        {/* Result Screenshot */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Результат в календаре:</label>
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
            {/* Placeholder for image - replace with actual <Image> when files are ready */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Скриншот результата
            </div>
            {/*
            <Image
              src={item.resultImage}
              alt={item.title}
              fill
              className="object-contain"
            />
            */}
          </div>
        </div>
      </div>
    </Card>
  );
}

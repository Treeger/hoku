'use client';

import type { ShowcaseItem } from "../model/types";
import { Card } from "@/components/ui/card";
import { CardHeading, BodyText } from "@/shared/ui/typography";

type Props = {
  item: ShowcaseItem;
};

export function ShowcaseCard({ item }: Props) {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <CardHeading className="mb-2">{item.title}</CardHeading>
        <BodyText>{item.description}</BodyText>
      </div>

      {/* Horizontal Layout: Player Left, Image Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <BodyText className="absolute inset-0 flex items-center justify-center">
              Скриншот результата
            </BodyText>
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

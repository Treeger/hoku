'use client';

import Image from "next/image";
import { Card } from "@/components/ui/card";

export function ShowcaseCard() {
  return (
    <Card className="overflow-hidden">
      {/* Two-column layout: 50/50 on desktop, vertical on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[600px]">
        {/* Left Block: Title + Description + Audio Player */}
        <div className="flex flex-col justify-center p-8 md:p-12 space-y-8">
          {/* Main heading */}
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Послушайте, как Hoku разговаривает с клиентом
          </h2>

          {/* Scenario description */}
          <p className="text-lg text-muted-foreground">
            Клиент звонит в салон красоты, чтобы записаться на маникюр.
          </p>

          {/* Result description */}
          <p className="text-base leading-relaxed">
            Hoku уточнила цель звонка, предложила свободное время и записала клиента в календарь. Всё — без участия администратора.
          </p>

          {/* Audio player */}
          <div className="space-y-3 pt-4">
            <audio controls className="w-full">
              <source src="/audio/demo-call-1.mp3" type="audio/mpeg" />
              Ваш браузер не поддерживает аудио.
            </audio>
          </div>
        </div>

        {/* Right Block: Calendar Screenshot (full height) */}
        <div className="relative min-h-[400px] md:min-h-full bg-muted">
          <Image
            src="/images/calendar.png"
            alt="Запись в календаре"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </Card>
  );
}

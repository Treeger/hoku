import { Clock, MessageCircle, CalendarCheck, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LandingSection } from "@/shared/ui/landing-section";

const benefits = [
  {
    icon: Clock,
    title: "24/7",
    description: "Отвечает на звонки днём и ночью — без перерывов, выходных и отпусков.",
  },
  {
    icon: MessageCircle,
    title: "Диалоги",
    description: "Говорит естественно и вежливо, следуя вашему скрипту общения.",
  },
  {
    icon: CalendarCheck,
    title: "Записи",
    description: "Создаёт встречи прямо в календаре — автоматически и без ошибок.",
  },
  {
    icon: TrendingUp,
    title: "Конверсия",
    description: "Превращает больше звонков в клиентов за счёт мгновенной реакции.",
  },
];

export function LandingValue() {
  return (
    <LandingSection background="surface-1">
      <div className="container px-4 md:px-6">
        <div className="space-y-20">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Hoku — ваш секретарь, который не берет выходных
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Каждый звонок обработан, каждая встреча записана.
              Никаких пропусков, ошибок и человеческого фактора.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-4 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="px-6 py-12 flex flex-col items-center justify-center text-center bg-surface-3">
                  <div className="mb-3 bg-black rounded-lg p-1.5">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  {benefit.description && (
                    <p className="text-muted-foreground text-xs leading-relaxed">{benefit.description}</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

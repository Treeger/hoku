import { PhoneOff, Clock, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LandingSection } from "@/shared/ui/landing-section";

const problems = [
  {
    icon: PhoneOff,
    title: "Пропущенные звонки = потерянные клиенты",
    description: "каждый непринятый вызов — упущенная запись",
  },
  {
    icon: Clock,
    title: "Администратор занят — Hoku не бывает",
    description: "пока вы на приёме или на линии, люди уходят к тем, кто ответил",
  },
  {
    icon: Moon,
    title: "После 20:00 телефон молчит",
    description: "а клиенты всё ещё звонят и записываются в другие места",
  },
];

export function LandingProblem() {
  return (
    <LandingSection background="surface-3">
      <div className="container py-16 md:px-6">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Когда звонят клиенты — вы не всегда успеваете ответить
            </h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Column: Short text with fact */}
            <div className="flex items-center">
              <div className="space-y-4 text-muted-foreground md:text-lg">
                <p>
                  Клиенты звонят — вы заняты. Звонок теряется.
                  Через пять минут этот клиент уже у конкурента.
                </p>
                <p className="font-medium">
                  До 30% звонков в бьюти, фитнесе и клиниках остаются без ответа —
                  даже если вы потом перезваниваете.
                </p>
              </div>
            </div>

            {/* Right Column: 3 cards in vertical stack */}
            <div className="flex flex-col gap-4">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <Card
                    key={index}
                    className="px-6 py-6 flex gap-4 items-start bg-surface-1 hover:brightness-95 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 bg-black rounded-lg p-1.5">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-semibold leading-snug">{problem.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{problem.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

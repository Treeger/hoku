import { PhoneOff, Clock, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LandingSection } from "@/shared/ui/landing-section";

const problems = [
  {
    icon: PhoneOff,
    title: "Пропущенные звонки = потерянные клиенты",
    description: "Каждый непринятый звонок — это упущенная возможность записать клиента",
  },
  {
    icon: Clock,
    title: "Администратор занят — Hoku не бывает",
    description: "Пока вы на приёме или на другой линии, клиенты уходят к конкурентам",
  },
  {
    icon: Moon,
    title: "После 20:00 телефон просто молчит",
    description: "А клиенты всё ещё звонят — и записываются в другие места",
  },
];

export function LandingProblem() {
  return (
    <LandingSection background="surface-3">
      <div className="container py-16 md:px-6">
        <div className="space-y-20">
          {/* Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Когда звонят клиенты — вы не всегда успеваете ответить
            </h2>
            <div className="space-y-4 text-muted-foreground md:text-lg">
              <p>
                Кто-то просит записать на вечер, кто-то уточняет цену,
                кто-то просто хочет попасть к «своему мастеру».
                Но если администратор занят или вы на приёме — звонок теряется.
              </p>
              <p className="font-medium">
                Через пять минут клиент уже у конкурента.
                И вы об этом даже не узнаёте.
              </p>
            </div>
            <p className="text-sm md:text-base text-muted-foreground italic pt-4">
              Мы проверяли: до 30% звонков в бьюти, фитнес и клиниках остаются без ответа.
              Даже если вы перезваниваете — поздно, клиент уже записался.
            </p>
          </div>

          {/* Problems Grid */}
          <div className="grid gap-4 md:grid-cols-3 md:gap-4 max-w-6xl mx-auto">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card
                  key={index}
                  className="px-6 py-12 flex flex-col items-center justify-center text-center bg-surface-1 hover:brightness-95 transition-all duration-200"
                >
                  <div className="mb-3 bg-black rounded-lg p-1.5">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 leading-snug">{problem.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{problem.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

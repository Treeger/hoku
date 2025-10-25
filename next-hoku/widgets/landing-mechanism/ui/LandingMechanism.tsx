import { Badge } from "@/components/ui/badge";
import { LandingSection } from "@/shared/ui/landing-section";
import { SectionHeading, SectionSubtitle, CardHeading, BodyText } from "@/shared/ui/typography";

const steps = [
  {
    number: 1,
    title: "Клиент звонит",
    description: "Звонок поступает на ваш номер. Если вы заняты или не ответили — Hoku берёт трубку вместо вас.",
  },
  {
    number: 2,
    title: "Hoku отвечает",
    description: "AI-секретарь вежливо приветствует клиента, уточняет цель звонка и распознаёт ключевые фразы.",
  },
  {
    number: 3,
    title: "Предлагает время",
    description: "Hoku проверяет доступные слоты в календаре и предлагает удобное время для записи.",
  },
  {
    number: 4,
    title: "Записывает клиента",
    description: "Подтверждённая встреча сразу появляется в вашем календаре, а вы получаете уведомление.",
  },
];

export function LandingMechanism() {
  return (
    <LandingSection background="surface-3">
      <div className="container px-4 md:px-6">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <SectionHeading>
              Как это работает?
            </SectionHeading>
            <SectionSubtitle>
              Всего четыре шага — и ваши звонки превращаются в подтверждённые встречи.
            </SectionSubtitle>
          </div>

          {/* Steps */}
          <div className="grid gap-8 md:gap-6 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                {/* Number Badge */}
                <div className="flex-shrink-0">
                  <Badge
                    variant="outline"
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                  >
                    {step.number}
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pt-2">
                  <CardHeading>{step.title}</CardHeading>
                  <BodyText>{step.description}</BodyText>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

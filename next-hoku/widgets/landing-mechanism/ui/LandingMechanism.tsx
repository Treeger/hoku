import { Badge } from "@/components/ui/badge";
import { LandingSection } from "@/shared/ui/landing-section";

const steps = [
  {
    number: 1,
    title: "Подключите номер",
    description: "Получите виртуальный номер или переключите существующий на AI секретаря",
  },
  {
    number: 2,
    title: "Настройте расписание",
    description: "Укажите рабочие часы, доступность кортов и правила бронирования",
  },
  {
    number: 3,
    title: "Запустите систему",
    description: "AI начинает принимать звонки и записывать клиентов автоматически",
  },
  {
    number: 4,
    title: "Контролируйте процесс",
    description: "Получайте уведомления о новых записях и управляйте расписанием в реальном времени",
  },
];

export function LandingMechanism() {
  return (
    <LandingSection background="surface-3">
      <div className="container px-4 md:px-6">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Как это работает?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Запуск занимает всего 15 минут
            </p>
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
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

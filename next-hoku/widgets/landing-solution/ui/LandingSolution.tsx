import { Zap, MessageCircle, Clock, CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LandingSection } from "@/shared/ui/landing-section";

const benefits = [
  {
    icon: Zap,
    title: "Отвечает за 5 секунд",
    description: "Без пауз и ожидания — клиент сразу слышит приветствие",
  },
  {
    icon: MessageCircle,
    title: "Говорит естественно",
    description: "Клиенты не понимают, что это AI — голос живой и вежливый",
  },
  {
    icon: Clock,
    title: "Работает 24/7",
    description: "Даже ночью и в выходные — каждый звонок будет принят",
  },
  {
    icon: CalendarCheck,
    title: "Создаёт записи автоматически",
    description: "Без участия администратора — встреча сразу в календаре",
  },
];

export function LandingSolution() {
  return (
    <LandingSection background="surface-1">
      <div className="container px-4 py-16 md:px-6">
        <div className="space-y-20">
          {/* Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Теперь Hoku отвечает за вас — быстро, вежливо и по-человечески
            </h2>
            <div className="space-y-4 text-muted-foreground md:text-lg">
              <p>
                Hoku берёт трубку, если вы не успели.
                Вежливо приветствует клиента, узнаёт цель звонка,
                предлагает свободное время и записывает в календарь.
              </p>
              <p>
                Клиент получает SMS-подтверждение,
                а вы видите запись в панели и можете прослушать звонок.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-4 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="px-6 py-12 flex flex-col items-center justify-center text-center bg-surface-3 hover:brightness-95 transition-all duration-200"
                >
                  <div className="mb-3 bg-black rounded-lg p-1.5">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{benefit.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Emotional Anchor */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg md:text-xl font-medium text-foreground/90 leading-relaxed">
              Hoku — как ваш личный секретарь.
              <br />
              Только не болеет, не устаёт и никогда не пропускает звонки.
            </p>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

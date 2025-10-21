import { Card } from "@/components/ui/card";

const benefits = [
  {
    title: "Никогда не пропустите звонок",
    description: "AI секретарь работает 24/7 и отвечает на все входящие звонки мгновенно",
  },
  {
    title: "Экономьте время администратора",
    description: "Автоматизируйте рутинные задачи записи и освободите время для важных дел",
  },
  {
    title: "Увеличьте загрузку кортов",
    description: "Больше записей = больше дохода. AI не теряет ни одного клиента",
  },
  {
    title: "Всегда вежливо и профессионально",
    description: "Одинаково высокий уровень обслуживания для каждого клиента",
  },
];

export function LandingValue() {
  return (
    <section className="w-full py-20">
      <div className="container px-4 md:px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Зачем это нужно вашему бизнесу?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Реальные преимущества для владельцев теннисных кортов
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

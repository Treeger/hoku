import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Ваш AI секретарь для теннисных кортов
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl lg:text-2xl">
              Принимает звонки, записывает клиентов и управляет расписанием — без вашего участия
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="text-lg px-8">
              Попробовать бесплатно
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Как это работает
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

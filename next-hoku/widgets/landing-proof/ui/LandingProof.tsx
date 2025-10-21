import { testimonials } from "../model/data";
import { TestimonialCard } from "./TestimonialCard";

export function LandingProof() {
  return (
    <section className="w-full py-20 bg-surface-1">
      <div className="container px-4 md:px-6">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Что говорят владельцы кортов
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Реальные отзывы от тех, кто уже использует AI секретаря
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

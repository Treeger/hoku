import type { Testimonial } from "../model/types";
import { Card } from "@/components/ui/card";

type Props = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: Props) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Rating */}
        <div className="flex gap-1">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <span key={i} className="text-yellow-500">
              ★
            </span>
          ))}
        </div>

        {/* Testimonial Text */}
        <p className="text-muted-foreground italic">"{testimonial.text}"</p>

        {/* Author */}
        <div className="border-t pt-4">
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </Card>
  );
}

import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Card — warm, softly elevated surface. `rounded-xl`, hairline warm border, subtle shadow
 * that lifts on hover (200ms). Composes from CardHeader / CardTitle / CardDescription /
 * CardContent / CardFooter. Token-styled, so it themes light/dark automatically.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
        "shadow-[0_1px_3px_rgb(23_21_19_/_0.06)] transition-shadow duration-200",
        "hover:shadow-[0_8px_24px_-8px_rgb(23_21_19_/_0.14)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-heading-3 m-0", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-body-small m-0 text-[hsl(var(--muted-foreground))]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 p-5 pt-0", className)} {...props} />;
}

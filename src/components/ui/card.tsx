import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cx(
        "rounded-2xl border border-transparent shadow transition duration-300",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cx("p-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

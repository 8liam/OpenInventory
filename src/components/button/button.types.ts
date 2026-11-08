import type { ButtonHTMLAttributes, Ref } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "destructiveOutline";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly small?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
};

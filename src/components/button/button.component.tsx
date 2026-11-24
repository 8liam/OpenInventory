import { cn } from "~/utils/cn";
import { BUTTON_BASE_CLASS, BUTTON_SIZE_CLASS, BUTTON_VARIANT_CLASS } from "./button.config";
import type { ButtonProps } from "./button.types";

export function Button({
  variant = "secondary",
  small = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        BUTTON_BASE_CLASS,
        BUTTON_VARIANT_CLASS[variant],
        small ? BUTTON_SIZE_CLASS.small : BUTTON_SIZE_CLASS.regular,
        className,
      )}
      {...rest}
    />
  );
}

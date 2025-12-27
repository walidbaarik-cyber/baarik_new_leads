import { FloatingLabel } from "flowbite-react";
import React from "react";

export default function TextInput({
  variant = "standard",
  label = "Label",
  value, // undefined => uncontrolled, defined => controlled
  onValueChange,
  validationfunction = () => true,
  onChange,
  ...props
}) {
  const isControlled = value !== undefined;

  const [internal, setInternal] = React.useState(value ?? "");
  const text = isControlled ? value ?? "" : internal;

  const isValid = React.useMemo(
    () => validationfunction(text),
    [text, validationfunction]
  );

  // keep internal in sync if parent switches or updates value
  React.useEffect(() => {
    if (isControlled) setInternal(value ?? "");
  }, [isControlled, value]);

  return (
    <FloatingLabel
      variant={variant}
      label={label}
      value={text}
      onChange={(e) => {
        const next = e.target.value ?? "";

        if (!isControlled) setInternal(next);
        onValueChange?.(next);

        onChange?.(e);
      }}
      isValid={isValid}
      {...props}
    />
  );
}

TextInput.displayName = "TextInput";

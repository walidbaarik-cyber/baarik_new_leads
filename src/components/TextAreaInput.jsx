import { Textarea } from "flowbite-react";
import React from "react";

export default function TextAreaInput({
  value = null,
  setValue = null,
  validationfunction = () => true,
  onChange,
  ...props
}) {
  const isControlled = value !== null;

  const [val, setValLocal] = React.useState(value ?? "");

  const setVal = React.useCallback(
    (nextRaw) => {
      const next = String(nextRaw);
      if (!validationfunction(next)) return;

      setValLocal(next);
      if (isControlled && typeof setValue === "function") setValue(next);
    },
    [isControlled, setValue, validationfunction]
  );

  // If parent changes value, sync local state
  React.useEffect(() => {
    if (isControlled) {
      if (!validationfunction(value)) return;
      setValLocal(value ?? "");
    }
  }, [isControlled, validationfunction, value]);

  return (
    <Textarea
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        onChange?.(e);
      }}
      {...props}
    />
  );
}

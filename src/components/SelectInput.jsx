import React from "react";
import { Button, Dropdown, DropdownItem } from "flowbite-react";

/**
 * A controlled dropdown select input component.
 * @param {string|null} value - external value to set the input to (if not provided, internal state is kept)
 * @param {(nextRaw: string|number|boolean) => void} setValue - function to set the external value (if not provided, no propagation)
 * @param {string} label - label to show if no option is selected
 * @param {Array<{value: string|number|boolean, label: string}>} options - options to show in the dropdown
 * @param {string} [DropdownClassName] - className to apply to the dropdown
 * @param {boolean} [showClearOption=false] - show option to clear the input
 * @param {string} [DropdownItemClassName] - className to apply to each dropdown item
 * @param {string} [id] - id to use for the hidden input (if no `name` is provided)
 * @param {string} [name] - name to use for the hidden input (if no `id` is provided)
 * @param {(nextRaw: string|number|boolean) => boolean} [validationfunction=() => true] - function to validate values before setting them
 * @param {boolean} [allowClear=true] - allow clearing the value even if it would fail validation
 */
export default function SelectInput({
  value = null,
  setValue = null,
  label = "Label",
  options = [],
  DropdownClassName = "",
  showClearOption = false,
  DropdownItemClassName = "",
  id,
  name = "",
  validationfunction = () => {
    return true;
  },
  allowClear = true, // optional: allow "" even if validation would reject it
}) {
  // Normalize values for comparisons (prevents "1" vs 1 mismatches)
  const norm = React.useCallback(
    (v) => (v === null || v === undefined ? "" : String(v)),
    []
  );

  const [val, setTheVal] = React.useState("");

  const safeSetVal = React.useCallback(
    (nextRaw) => {
      const next = norm(nextRaw);

      // Always allow clearing if requested
      if (next === "" && allowClear) {
        setTheVal("");
        return;
      }

      if (validationfunction(nextRaw)) {
        setTheVal(next);
        return;
      }

      console.error(
        `value ${String(
          nextRaw
        )} is not valid, the first option will be set if any`
      );

      // Fallback to first option if present, else clear
      if (options?.[0] && "value" in options[0]) {
        const fallback = norm(options[0].value);
        setTheVal(fallback);
      } else {
        setTheVal("");
      }
    },
    [allowClear, norm, options]
  );

  // Selected option (safe)
  const selected = React.useMemo(() => {
    const n = val;
    return options.find((o) => norm(o?.value) === n);
  }, [options, norm, val]);

  // Propagate internal value to parent (if controlled setter provided)
  React.useEffect(() => {
    if (typeof setValue === "function") setValue(val);
  }, [setValue, val]);

  // Sync internal state from external `value` and `options`
  React.useEffect(() => {
    // If value is not provided, don't force anything. (Keep internal state)
    if (value === null || value === undefined || value === "") return;

    // If there are no options, nothing to reconcile
    if (!options?.length) return;

    const incoming = norm(value);
    let inOptions = options.some((o) => norm(o?.value) === incoming);
    if (incoming === "" && allowClear) inOptions = true;

    if (inOptions) {
      // Set to incoming value (runs through validation)
      safeSetVal(value);
    } else {
      console.error(
        `value ${String(
          value
        )} is not in the options, the first option will be set`
      );
      safeSetVal(options[0].value);
    }
  }, [value, options, norm, safeSetVal]);

  // Nothing to render if no options
  if (!options?.length) return null;

  const hiddenName = name || id || undefined;
  const hiddenId = id || undefined;

  return (
    <div
    // tabIndex={0} // makes Delete key handling reliable
    >
      {/* Hidden input for HTML form submission */}
      {hiddenName ? (
        <input
          type="hidden"
          id={hiddenId || ""}
          name={hiddenName || ""}
          value={val}
        />
      ) : null}

      <Dropdown
        label={""}
        renderTrigger={() => (
          <Button
            color="alternative"
            type="button"
            aria-haspopup="listbox"
            aria-expanded="false"
            className="w-full text-left"
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                safeSetVal("");
              }
            }}
          >
            {selected ? (
              <span className="line-clamp-1 whitespace-nowrap overflow-hidden">
                {selected.label}
              </span>
            ) : (
              <span className="line-clamp-1 whitespace-nowrap overflow-hidden">
                {label}
              </span>
            )}
          </Button>
        )}
        className={DropdownClassName}
      >
        <div className="max-h-60 overflow-y-auto">
          {showClearOption && (
            <DropdownItem
              className={DropdownItemClassName}
              onClick={() => safeSetVal("")}
            >
              Clear
            </DropdownItem>
          )}

          {options.map((option) => {
            const optionValueNorm = norm(option.value);
            const isSelected = optionValueNorm === val;

            return (
              <DropdownItem
                key={optionValueNorm} // stable even for numeric/bool values
                onClick={() => safeSetVal(option.value)}
                selected={isSelected}
                className={`text-start line-clamp-1 whitespace-nowrap overflow-hidden ${DropdownItemClassName}`}
              >
                {option.label}
              </DropdownItem>
            );
          })}
        </div>
      </Dropdown>
    </div>
  );
}

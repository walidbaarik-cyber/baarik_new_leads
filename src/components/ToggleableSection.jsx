import React from "react";
import { Button } from "flowbite-react";

const splitClasses = (s) => (s ?? "").trim().split(/\s+/).filter(Boolean);

export default function ToggleableSection({
  children,
  isOpen = null,
  setIsOpen = null,

  buttonText = { onOpen: "Close", onClose: "Open" },
  buttonIcon,
  rotateIcon = false,
  buttonOnClick,
  buttonClassName = "",
  ButtonOnOpenClassName = "",
  ButtonOnCloseClassName = "",
  buttonColor,
  outline = true,

  containerClassName = "",
  containerOnOpenClassName = "opacity-100",
  containerOnCloseClassName = "opacity-0",
  containerAfterCloseClassName = "hidden",
  containerBeforeOpenClassName = "",

  duration = 300,

  // optional: if you want to provide your own id for aria-controls
  contentId: contentIdProp,
}) {
  const controlled = typeof isOpen === "boolean";
  const [uncontrolledShow, setUncontrolledShow] = React.useState(
    controlled ? isOpen : false
  );
  const show = controlled ? isOpen : uncontrolledShow;

  const reactId = React.useId();
  const contentId = contentIdProp ?? `toggleable-section-${reactId}`;

  const containerRef = React.useRef(null);
  const closeTimerRef = React.useRef(null);
  const raf1 = React.useRef(null);
  const raf2 = React.useRef(null);

  // Notify parent if they provided setIsOpen
  React.useEffect(() => {
    if (typeof setIsOpen === "function") setIsOpen(show);
  }, [show, setIsOpen]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (raf1.current) cancelAnimationFrame(raf1.current);
      if (raf2.current) cancelAnimationFrame(raf2.current);
    };
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // cancel any pending work
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (raf1.current) cancelAnimationFrame(raf1.current);
    if (raf2.current) cancelAnimationFrame(raf2.current);

    const add = (cls) => splitClasses(cls).forEach((c) => el.classList.add(c));
    const remove = (cls) =>
      splitClasses(cls).forEach((c) => el.classList.remove(c));

    if (show) {
      // prepare to open (ensure element participates in layout)
      add(containerBeforeOpenClassName);
      remove(containerAfterCloseClassName);

      // next frame: switch from "closed" -> "open" to trigger transition
      raf1.current = requestAnimationFrame(() => {
        raf2.current = requestAnimationFrame(() => {
          remove(containerOnCloseClassName);
          add(containerOnOpenClassName);
        });
      });
    } else {
      // start close transition
      remove(containerOnOpenClassName);
      add(containerOnCloseClassName);

      // after transition ends, hide/remove layout class
      closeTimerRef.current = setTimeout(() => {
        remove(containerBeforeOpenClassName);
        add(containerAfterCloseClassName);
      }, duration);
    }
  }, [
    show,
    containerBeforeOpenClassName,
    containerAfterCloseClassName,
    containerOnCloseClassName,
    containerOnOpenClassName,
    duration,
  ]);

  const text =
    typeof buttonText === "string"
      ? buttonText
      : typeof buttonText === "object" && buttonText
      ? show
        ? buttonText.onOpen
        : buttonText.onClose
      : show
      ? "Close"
      : "Open";

  const color =
    typeof buttonColor === "string"
      ? buttonColor
      : typeof buttonColor === "object" && buttonColor
      ? show
        ? buttonColor.onOpen
        : buttonColor.onClose
      : show
      ? "red"
      : "green";

  return (
    <div>
      <Button
        aria-expanded={show}
        aria-controls={contentId}
        onClick={() => {
          const toggle = (prev) => {
            const next = !prev;
            buttonOnClick?.(next);
            return next;
          };

          if (controlled) {
            buttonOnClick?.(!show);
            if (typeof setIsOpen === "function") setIsOpen(!show);
          } else {
            setUncontrolledShow(toggle);
          }
        }}
        className={`transition-all ease-in-out ${
          show ? ButtonOnOpenClassName : ButtonOnCloseClassName
        } ${buttonClassName} ${buttonIcon ? "flex items-center gap-2" : ""}`}
        outline={outline}
        color={color}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {text}
        {buttonIcon && (
          <div
            className={`transition-all ease-in-out ${
              rotateIcon ? (show ? "rotate-180" : "rotate-0") : ""
            }`}
            style={{ transitionDuration: `${duration}ms` }}
          >
            {typeof buttonIcon === "function" ? buttonIcon(show) : buttonIcon}
          </div>
        )}
      </Button>

      <div
        id={contentId}
        ref={containerRef}
        className={containerClassName}
        style={{ transitionDuration: `${duration}ms` }}
        // ✅ Screen readers: remove subtree from the accessibility tree when closed
        aria-hidden={!show}
        // ✅ Browser focus + pointer + programmatic focus: skip everything inside when closed
        // (React will render it as an attribute when falsey/undefined is avoided)
        inert={!show}
      >
        {children}
      </div>
    </div>
  );
}

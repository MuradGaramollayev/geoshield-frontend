import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown, Search } from "lucide-react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  mono?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, leading, trailing, mono, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? (label ? `f-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-2 mb-1.5">
          {label}
        </label>
      )}
      <div className="field">
        {leading && <span className="text-text-3 shrink-0 inline-flex">{leading}</span>}
        <input ref={ref} id={inputId} className={mono ? "code" : ""} {...rest} />
        {trailing}
      </div>
      {hint && <p className="text-xs text-text-3 mt-1.5">{hint}</p>}
    </div>
  );
});

export function SearchField({
  className = "",
  shortcut,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { shortcut?: string }) {
  return (
    <div className={`field ${className}`}>
      <Search size={16} className="text-text-3 shrink-0" />
      <input type="search" {...rest} />
      {shortcut && (
        <kbd className="code text-2xs text-text-3 bg-sunken rounded-[6px] px-1.5 py-0.5 shrink-0">{shortcut}</kbd>
      )}
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function SelectField({ label, className = "", id, children, ...rest }: SelectFieldProps) {
  const selectId = id ?? (label ? `s-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-2 mb-1.5">
          {label}
        </label>
      )}
      <div className="field relative">
        <select id={selectId} className="pr-6" {...rest}>
          {children}
        </select>
        <ChevronDown size={16} className="text-text-3 absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
}

import React, { FC, useId } from "react";
import { options } from "@/lib/types";
import { FaChevronDown } from "react-icons/fa"; // Small down arrow

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: options[];
  label: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const InputDropDown: FC<Props> = ({
  options,
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  className,
  ...rest
}) => {
  const autoId = useId();
  const id = rest.id || autoId;

  return (
    <div className={`relative ${className}`}>
      <div className="relative mt-4">
        <select
          id={id}
          className={`w-full appearance-none p-2 rounded-lg border focus:border-blue-400 focus:outline-hidden focus:ring-0 peer
            ${disabled ? "bg-gray-700 text-primary/50" : "text-primary bg-transparent"} 
            ${error ? "text-red-500 border-red-500" : "border-gray-600"}
            pr-8`}
          disabled={disabled}
          {...rest}
        >
          
          <option value="" hidden>
            Select
          </option>
          {options.map((option) => (
            <option
              className="bg-primary-foreground text-primary"
              key={option.label ?? option.value}
              value={option.value}
              aria-label={option.label ?? option.value}
            >
              {option.label ?? option.value}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary-foreground transition-transform duration-300">
          <FaChevronDown size={14} />
        </div>

        <label
          htmlFor={id}
          className={`absolute text-md text-card-foreground duration-300 scale-[0.85] transform -translate-y-5 top-2 z-10 origin-[0] bg-background px-2
          peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2
          peer-focus:top-2 peer-focus:scale-[.85] peer-focus:-translate-y-5 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto start-1`}
        >
          {label}
          <span className={required ? "absolute text-red-500 text-xl pl-[0.1rem] -translate-y-1" : "hidden"}>*</span>
        </label>
      </div>

      {error ? (
        <div className="m-1 text-sm text-red-500">{error}</div>
      ) : helperText ? (
        <div className="m-1 text-sm text-sky-500">{helperText}</div>
      ) : null}
    </div>
  );
};

export default InputDropDown;
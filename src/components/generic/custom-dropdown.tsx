import React, {FC} from "react";
import {options} from "@/lib/types";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: options[];
  id?: string,
  label: string,
  helperText?: string,
  color?: string,
  disabled?: boolean,
  required?: boolean,
  className?: string
}

const CustomDropDown: FC<Props> = ({
                          options, id, label, helperText, color, disabled = false, required = false, className, ...rest
}) => {

  return (
    <div className={className}>
      <div className="relative mt-4">
        <select id={id}
                className={`w-full py-[11px] px-2 rounded-lg border focus:border-blue-400 focus:outline-hidden focus:ring-0 peer
                            ${disabled ? "bg-gray-700 text-primary/50" : "text-primary bg-transparent"} 
                            ${color == "error" ? "text-red-500 border-red-500" : "border-gray-600"}`}
                disabled={disabled}
                {...rest}>
          <option className={"bg-primary-foreground text-primary"}>
            Select
          </option>
          {options.map((option) => (
            <option className={"bg-primary-foreground text-primary"} key={option.label ? option.label : option.value}
                    value={option.value} aria-label={option.label ? option.label : option.value}>
              {option.label ? option.label : option.value}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className={`absolute text-md text-card-foreground duration-300 scale-[0.85] transform -translate-y-5 top-2 z-10 origin-[0] bg-card px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-[.85] peer-focus:-translate-y-5 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto start-1`}>
          {label}
          <span className={required ? "absolute text-red-500 text-xl pl-[0.1rem] -translate-y-1" : "hidden"}>*</span>
        </label>
      </div>
      <div
        className={helperText ? ((color == "error" ? "text-red-500" : "text-sky-300") + " flex mt-1 ml-1 text-sm") : "hidden"}>
        {helperText}
      </div>
    </div>
  );
};

export default CustomDropDown;

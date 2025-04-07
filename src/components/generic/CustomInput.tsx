import React, { FC } from "react"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    id?: string;
    label: string;
    placeholder?: string;
    className?: string;
    helperText?: string;
    color?: string;
    disabled?: boolean;
    required?: boolean;
    floating?: boolean;
    pre?:string;
    sign?: string;
    readOnly?: boolean;
}

const CustomInput: FC<Props> = ({
    id, label, placeholder="", className, helperText, color, disabled, required=false, floating = true, readOnly, pre="", sign="", ...rest
  }) => {
    return (
        <div className={className}>
          <div className={`relative ${floating ? "mt-4" : "mt-6"}`}>
            {
              pre &&
              <div className={`absolute text-primary pl-3 pt-[0.575rem] ${disabled ? "text-primary/50" : "text-primary"}`}>
                {pre}
              </div>
            }
            {
              sign && <div
                className={`absolute text-lg pl-7 pt-2 -translate-y-1 ${disabled ? "text-primary/50" : "text-primary"}`}>
                {sign}
              </div>
            }
            <input
              id={id}
              className={`w-full py-2 border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-0 peer 
                            ${pre ? 'pl-9 pr-2.5' : 'px-2.5'} ${disabled ? "bg-muted/50" : "text-primary bg-transparent"}
                            ${disabled ? "text-primary/50 border-gray-600" : color == "error" ? 'text-destructive-foreground border-red-500' : 'text-primary border-gray-600'}`}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              readOnly={readOnly}
              autoComplete={"off"}
              {...rest}
            />
            <label
              htmlFor={id}
              className={`text-card-foreground absolute -translate-y-5 z-10 start-1 
                            ${floating ? "text-md duration-300 scale-[0.85] transform top-2 z-10 origin-[0] bg-card px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-[.85] peer-focus:-translate-y-5 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                : "text-sm"}`}>
              {label}
              {required && <span className="absolute text-red-500 text-xl pl-[0.1rem] -translate-y-1">*</span>}
              {readOnly && <span className="pl-1">(Read-only)</span>}
            </label>
          </div>
          {
            helperText && <div className={`m-1 text-sm ${color == "error" ? "text-red-500" : "text-sky-500"}`}>
              {helperText}
            </div>
          }
        </div>
    )
}

export default CustomInput;
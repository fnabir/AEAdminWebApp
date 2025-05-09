import React, { forwardRef, useId, useState } from "react"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helperText?: string;
    error?: string;
    floating?: boolean;
}

const InputPassword = forwardRef<HTMLInputElement, Props>(({
  label,
  className,
  placeholder = "",
  helperText,
  error,
  required,
  floating = true,
  readOnly,
  ...rest
}, ref) => {
  const autoId = useId();
  const id = rest.id || autoId;
  
  const [showPassword, setShowPassword] = useState(false);
    
  return (
      <div className={className}>
        <div className={`relative ${floating ? "mt-4" : "mt-6"}`}>
          <input
            id={id}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`w-full py-2 border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-0 peer pl-2.5 pr-10
                        ${error ? "border-red-500 text-destructive-foreground focus:border-red-500"
                        : "bg-transparent text-primary border-gray-600 focus:border-blue-500"}`}
            placeholder={placeholder}
            readOnly={readOnly}
            autoComplete={"off"}
            {...rest}
          />
          <label
            htmlFor={id}
            className={`text-card-foreground absolute -translate-y-5 z-10 start-1 
              ${floating ? "text-md duration-300 scale-[0.85] transform top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-[.85] peer-focus:-translate-y-5 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              : "text-sm"}`}>
            {label}
            {required && <span className="pl-1 text-red-500">*</span>}
            {readOnly && <span className="pl-1">(Read-only)</span>}
          </label>
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <FaRegEyeSlash className="size-5" /> : <FaRegEye className="size-5" />}
          </button>
        </div>
        {
          error ? 
          <div className="m-1 text-sm text-red-500">{error}</div>
          : helperText && <div className="m-1 text-sm text-sky-500">{helperText}</div>
        }
      </div>
  )
})

InputPassword.displayName = "InputPassword";

export default InputPassword;
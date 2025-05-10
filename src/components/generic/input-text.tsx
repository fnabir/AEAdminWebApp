import React, { forwardRef, useId } from "react"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helperText?: string;
    error?: string;
    floating?: boolean;
    pre?: string;
    sign?: string;
}

const InputText = forwardRef<HTMLInputElement, Props>(({
  label,
  placeholder = "",
  className,
  helperText,
  error,
  disabled,
  required,
  floating = true,
  readOnly,
  pre = "",
  sign = "",
  ...rest
}, ref) => {
  const autoId = useId();
  const id = rest.id || autoId;

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
          ref={ref}
          className={`w-full py-2 border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-0 peer 
                        ${pre ? 'pl-9 pr-2.5' : 'px-2.5'} 
                        ${disabled ? "bg-muted/50 text-primary/50 border-gray-600"
                          : error ? "border-red-500 text-destructive-foreground focus:border-red-500"
                          : "bg-transparent text-primary border-gray-600 focus:border-blue-500"}`}
          placeholder={placeholder}
          disabled={disabled}
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
      </div>
      {
        error ? <div className="m-1 text-sm text-red-500">{error}</div>
        : helperText ? <div className="m-1 text-sm text-sky-500">{helperText}</div>
        : null
      }
    </div>
  )
})

InputText.displayName = "InputText";

export default InputText;
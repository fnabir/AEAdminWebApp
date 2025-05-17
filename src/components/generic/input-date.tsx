import React, { forwardRef, useId } from "react"

interface InputDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const InputDate = forwardRef<HTMLInputElement, InputDateProps>(({
  label,
  className = "",
  helperText,
  error,
  disabled = false,
  required = false,
  ...rest
}, ref) => {
  const autoId = useId()
  const id = rest.id || autoId
	
  return (
		<div className={`relative mt-4 ${className}`}>
			<div>
				<input
					id={id}
          ref={ref}
          type="date"
					className={`w-full px-2.5 py-2 border rounded-lg focus:border-blue-400 focus:outline-none focus:ring-0 peer
            ${disabled ? "bg-muted text-gray-400 border-gray-500" : ""}
            ${error ? "text-red-500 border-red-500" : "text-card-foreground border-gray-500"}
            ${!disabled && error ? "bg-transparent" : ""}
          `}
					disabled={disabled}
					{...rest}
				/>
				<label
					htmlFor={id}
					className={`text-card-foreground absolute text-md duration-300 scale-[0.85] transform -translate-y-5 top-2 z-10 origin-[0] bg-card px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-[.85] peer-focus:-translate-y-5 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto start-1`}>
					{label}
					<span className={required ? "absolute text-red-600 text-xl pl-[0.1rem] -translate-y-1" : "hidden"}>*</span>
				</label>
			</div>
			{
        error ? 
        <div className="m-1 text-sm text-red-500">{error}</div>
        : helperText && <div className="m-1 text-sm text-sky-500">{helperText}</div>
      }
		</div>
  )
})

InputDate.displayName = "InputDate";
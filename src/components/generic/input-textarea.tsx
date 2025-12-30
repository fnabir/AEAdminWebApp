import React, { forwardRef, useId } from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  floating?: boolean;
  required?: boolean;
  readOnly?: boolean;
}

const InputTextarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      label,
      placeholder = '',
      className,
      helperText,
      error,
      disabled,
      required = false,
      floating = true,
      readOnly = false,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = rest.id || autoId;

    return (
      <div className={className}>
        <div className={`relative ${floating ? 'mt-4' : 'mt-6'}`}>
          <textarea
            id={id}
            ref={ref}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete="off"
            className={`w-full py-2 px-2.5 border rounded-lg resize-none min-h-25 focus:outline-none focus:ring-0 peer
            ${
              disabled
                ? 'bg-muted/50 text-primary/50 border-gray-600'
                : error
                ? 'border-destructive text-destructive-foreground focus:border-destructive'
                : 'bg-transparent text-primary border-gray-600 focus:border-blue-500'
            }
          `}
            {...rest}
          />
          <label
            htmlFor={id}
            className={`text-card-foreground absolute -translate-y-5 z-10 start-1 
            ${
              floating
                ? 'text-md duration-300 scale-[0.85] transform top-2 z-10 origin-left bg-background px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-[.85] peer-focus:-translate-y-5 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto'
                : 'text-sm'
            }`}
          >
            {label}
            {required && <span className="pl-1 text-destructive">*</span>}
            {readOnly && <span className="pl-1">(Read-only)</span>}
          </label>
        </div>
        {error && error.length > 0 ? (
          <div className="m-1 text-sm text-destructive">{error}</div>
        ) : helperText ? (
          <div className="m-1 text-sm text-sky-500">{helperText}</div>
        ) : null}
      </div>
    );
  },
);

InputTextarea.displayName = 'InputTextarea';

export default InputTextarea;

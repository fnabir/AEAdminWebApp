import React from 'react';

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  faded?: boolean;
};

const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
  faded = true,
}) => {
  return (
    <div
      className={`${
        orientation == 'horizontal'
          ? `w-full h-0.5 bg-linear-to-r`
          : `self-stretch w-0.5 bg-linear-to-b`
      }
                    ${
                      faded
                        ? 'from-transparent via-primary to-transparent'
                        : 'bg-primary/40'
                    } rounded-full ${className}`}
    />
  );
};

export default Separator;

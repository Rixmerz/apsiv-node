import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'btn focus-visible transition-all duration-200 font-bold text-lg';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md',
    secondary: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    large: 'btn-lg text-xl',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.default}
    ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}
    ${className}
  `;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
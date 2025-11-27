// frontend/src/components/ui/Button.jsx

import React from 'react';
import PropTypes from 'prop-types';

const baseStyles = "px-4 py-2 rounded-md font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

const variantStyles = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
};

const sizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg px-6 py-3",
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', ...props }) => {
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <button
      onClick={onClick}
      className={styles}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;

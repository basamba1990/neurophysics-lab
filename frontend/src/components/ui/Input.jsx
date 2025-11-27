// frontend/src/components/ui/Input.jsx

import React from 'react';
import PropTypes from 'prop-types';

const baseStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

const Input = React.forwardRef(({ type = 'text', className = '', error, ...props }, ref) => {
  const styles = `${baseStyles} ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`;

  return (
    <input
      ref={ref}
      type={type}
      className={styles}
      {...props}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.bool,
};

export default Input;

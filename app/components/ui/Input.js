// app/components/ui/Input.js
"use client";

import React from "react";
import { getInputStyles } from "@/app/utils/theme";

const Input = ({
  label,
  id,
  error = false,
  errorMessage = "",
  className = "",
  ...props
}) => {
  const inputStyles = getInputStyles(error);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input id={id} className={inputStyles} {...props} />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-danger-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;

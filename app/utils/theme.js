// app/utils/theme.js

/**
 * Returns the appropriate status color based on the given status
 * @param {string} status - The status to get the color for
 * @returns {string} - The Tailwind class for that status
 */
export const getStatusColor = (status) => {
  const statusMap = {
    // Attendance status
    present: "bg-success-100 text-success-800",
    absent: "bg-danger-100 text-danger-800",
    late: "bg-warning-100 text-warning-800",

    // Leave request status
    pending: "bg-warning-100 text-warning-800",
    approved: "bg-success-100 text-success-800",
    rejected: "bg-danger-100 text-danger-800",

    // Task/call status
    not_contacted: "bg-secondary-100 text-secondary-800",
    not_answered: "bg-warning-100 text-warning-800",
    called_not_listen: "bg-danger-100 text-danger-800",
    in_progress: "bg-primary-100 text-primary-800",
    succeeded: "bg-success-100 text-success-800",

    // Priority
    high: "bg-danger-100 text-danger-800",
    medium: "bg-warning-100 text-warning-800",
    low: "bg-success-100 text-success-800",
  };

  return statusMap[status] || "bg-secondary-100 text-secondary-800";
};

/**
 * Returns button styles based on variant
 * @param {string} variant - The button variant (primary, secondary, success, etc.)
 * @param {boolean} disabled - Whether the button is disabled
 * @returns {string} - The Tailwind classes for that button variant
 */
export const getButtonStyles = (variant = "primary", disabled = false) => {
  if (disabled) {
    return "bg-gray-300 text-gray-500 cursor-not-allowed";
  }

  const variantMap = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-secondary-600 text-white hover:bg-secondary-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    accent: "bg-accent-600 text-white hover:bg-accent-700",
    outline: "border border-primary-600 text-primary-600 hover:bg-primary-50",
    ghost: "text-primary-600 hover:bg-primary-50",
  };

  return `${
    variantMap[variant] || variantMap.primary
  } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`;
};

/**
 * Returns card styles with different elevation levels
 * @param {number} elevation - The elevation level (1-5)
 * @returns {string} - The Tailwind classes for that card elevation
 */
export const getCardStyles = (elevation = 1) => {
  const elevationMap = {
    1: "shadow-sm",
    2: "shadow",
    3: "shadow-md",
    4: "shadow-lg",
    5: "shadow-xl",
  };

  return `bg-white rounded-lg ${
    elevationMap[elevation] || elevationMap[1]
  } overflow-hidden`;
};

/**
 * Returns input field styles
 * @param {boolean} error - Whether the input has an error
 * @returns {string} - The Tailwind classes for the input
 */
export const getInputStyles = (error = false) => {
  const baseStyles =
    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-gray-900 bg-white";

  if (error) {
    return `${baseStyles} border-danger-300 focus:border-danger-500 focus:ring-danger-500`;
  }

  return `${baseStyles} border-gray-300 focus:border-primary-500 focus:ring-primary-500`;
};

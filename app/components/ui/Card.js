// app/components/ui/Card.js
"use client";

import React from "react";
import { getCardStyles } from "@/app/utils/theme";

const Card = ({ children, elevation = 2, className = "", ...props }) => {
  const cardStyles = getCardStyles(elevation);

  return (
    <div className={`${cardStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card subcomponents
// eslint-disable-next-line react/display-name
Card.Header = ({ children, className = "", ...props }) => (
  <div className={`p-5 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

// eslint-disable-next-line react/display-name
Card.Body = ({ children, className = "", ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

// eslint-disable-next-line react/display-name
Card.Footer = ({ children, className = "", ...props }) => (
  <div className={`p-5 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;

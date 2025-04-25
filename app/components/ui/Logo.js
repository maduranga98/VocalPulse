// app/components/ui/Logo.js
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = ({ size = "md", withText = true, className = "" }) => {
  // Size classes for the logo image
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Text size classes
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  // Get dimensions from size classes for use with Image component
  const getDimensions = (sizeClass) => {
    const size = parseInt(sizeClass.split("h-")[1]);
    // Convert Tailwind size classes to pixels (approximate)
    switch (size) {
      case 8:
        return 32;
      case 10:
        return 40;
      case 12:
        return 48;
      case 16:
        return 64;
      default:
        return 50;
    }
  };

  const dimension = getDimensions(iconSize);

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className={`relative flex-shrink-0 ${iconSize}`}>
        {/* Use Next.js Image component for logo */}
        <Image
          src="/logo.png"
          alt="VocalPulse Logo"
          width={dimension}
          height={dimension}
          className="rounded-md"
        />
      </div>

      {withText && (
        <div className="ml-2 flex flex-col">
          <span
            className={`font-bold tracking-tight ${textSize} text-gray-900`}
          >
            VocalPulse
          </span>
          <span className="text-xs text-gray-500">by Lumora Ventures</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;

import React from "react";

interface CareCircleLogoProps {
  className?: string;
}

/**
 * Custom CareCircle brand logo — interlocking circles with a heart center,
 * representing community care and connection.
 * Uses `currentColor` so it adapts to its container's text color.
 */
export function CareCircleLogo({ className = "h-6 w-6" }: CareCircleLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left circle */}
      <circle
        cx="24"
        cy="28"
        r="16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Right circle */}
      <circle
        cx="40"
        cy="28"
        r="16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Heart at the overlap center */}
      <path
        d="M32 30
           C32 26, 28 23, 26 25
           C24 27, 26 30, 32 35
           C38 30, 40 27, 38 25
           C36 23, 32 26, 32 30Z"
        fill="currentColor"
      />
      {/* Two small open hands / arcs beneath, representing support */}
      <path
        d="M18 44 Q24 52 32 48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M46 44 Q40 52 32 48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}


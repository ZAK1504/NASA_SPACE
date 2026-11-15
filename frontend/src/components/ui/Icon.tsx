import React from "react";

interface IconProps {
  name?: string;
  className?: string;
}

const P: Record<string, React.ReactNode> = {
  sky: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c3 2.6 3 14.4 0 17M12 3.5c-3 2.6-3 14.4 0 17" />
    </>
  ),
  object: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
    </>
  ),
  spectral: (
    <>
      <path d="M2.5 14c2-6 3.5-6 5 0s3 6 5 0 3.5-6 5 0 1.8 3 2.5 3" />
      <path d="M3 20h18" />
    </>
  ),
  time: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  discovery: (
    <>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  mine: (
    <>
      <path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10z" />
    </>
  ),
  curve: (
    <>
      <path d="M3 18V5" />
      <path d="M3 18h18" />
      <path d="M5 14c2.5-9 4.5-9 6 0s3.5 9 6 0 2-4 3-4" />
    </>
  ),
  mission: (
    <>
      <path d="M12 3c3.2 2.4 4.6 6 4 10l-4 3-4-3c-.6-4 .8-7.6 4-10z" />
      <circle cx="12" cy="9.5" r="1.6" />
      <path d="M8 14l-3 3.5L8.5 17M16 14l3 3.5-3.5-.5M10.5 18.5L12 21l1.5-2.5" />
    </>
  ),
  game: (
    <>
      <path d="M8 5.5v13l11-6.5z" />
    </>
  ),
};

export const Icon: React.FC<IconProps> = ({ name = "sky", className = "" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name] || P.sky}
    </svg>
  );
};

export default Icon;

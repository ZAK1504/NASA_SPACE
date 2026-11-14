import React, { useEffect, useRef } from "react";
import { drawColor } from "../../lib/art";

interface PicProps {
  kind?: string;
  seed?: number;
  w?: number;
  h?: number;
  src?: string;
  alt?: string;
  className?: string;
}

export const Pic: React.FC<PicProps> = ({
  kind = "nebula",
  seed = 1,
  w = 480,
  h = 360,
  src = "",
  alt = "",
  className = "",
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!src && ref.current) {
      drawColor(ref.current, { kind, seed, w, h });
    }
  }, [kind, seed, w, h, src]);

  if (src) {
    return <img className={`pic-img ${className}`} src={src} alt={alt} />;
  }

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      role="img"
      aria-label={alt}
      className={className}
    />
  );
};

export default Pic;

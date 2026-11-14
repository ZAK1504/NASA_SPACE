import React, { useEffect, useRef } from 'react';

interface Star { x: number; y: number; size: number; opacity: number; speed: number; phase: number; }

export const StarField: React.FC<{ className?: string; starCount?: number }> = ({
  className = '',
  starCount = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];

    const init = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
      stars = Array.from({ length: starCount }, () => ({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        size:    Math.random() * 1.4 + 0.3,
        opacity: Math.random() * 0.65 + 0.1,
        speed:   Math.random() * 0.025 + 0.005,
        phase:   Math.random() * Math.PI * 2,
      }));
    };

    init();

    const onResize = () => { init(); };
    window.addEventListener('resize', onResize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      for (const s of stars) {
        const alpha = s.opacity * (0.4 + 0.6 * Math.sin(t * s.speed * 80 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`starfield ${className}`}
    />
  );
};

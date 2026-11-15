import React, { useEffect, useState } from "react";

interface DecryptedTextProps {
  text: string;
  className?: string;
  interval?: number;
  revealDirection?: "start" | "end";
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  className = "",
  interval = 40,
  revealDirection = "start",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  useEffect(() => {
    if (!isDecrypting) return;

    let currentIndex = revealDirection === "start" ? 0 : text.length - 1;
    const increment = revealDirection === "start" ? 1 : -1;
    const iterations = text.length;
    let iteration = 0;

    const intervalId = setInterval(() => {
      setDisplayText((prev) => {
        const textArray = (prev || text).split("");

        if (revealDirection === "start") {
          for (let i = 0; i < text.length; i++) {
            if (i < currentIndex) {
              textArray[i] = text[i];
            } else {
              textArray[i] = characters[Math.floor(Math.random() * characters.length)];
            }
          }
        } else {
          for (let i = 0; i < text.length; i++) {
            if (i > currentIndex) {
              textArray[i] = text[i];
            } else {
              textArray[i] = characters[Math.floor(Math.random() * characters.length)];
            }
          }
        }

        return textArray.join("");
      });

      if (iteration >= iterations) {
        clearInterval(intervalId);
        setDisplayText(text);
      }

      currentIndex += increment;
      iteration++;
    }, interval);

    return () => clearInterval(intervalId);
  }, [isDecrypting, text, interval, revealDirection]);

  const handleMouseEnter = () => {
    setIsDecrypting(true);
    setDisplayText(
      text
        .split("")
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join("")
    );
  };

  const handleMouseLeave = () => {
    setIsDecrypting(false);
    setDisplayText(text);
  };

  return (
    <span
      className={`inline-block cursor-pointer select-none transition-colors ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText || text}
    </span>
  );
};

export default DecryptedText;

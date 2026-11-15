import React, { useEffect, useState } from "react";

interface TextTypeProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delay?: number;
  loop?: boolean;
  showCursor?: boolean;
}

export const TextType: React.FC<TextTypeProps> = ({
  text,
  className = "",
  typingSpeed = 70,
  deletingSpeed = 40,
  delay = 0,
  loop = false,
  showCursor = true,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const typeText = () => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
        timeout = setTimeout(typeText, typingSpeed);
      } else if (loop) {
        setIsTyping(false);
        timeout = setTimeout(deleteText, 1500);
      }
    };

    const deleteText = () => {
      if (currentIndex > 0) {
        setDisplayText(text.slice(0, currentIndex - 1));
        currentIndex--;
        timeout = setTimeout(deleteText, deletingSpeed);
      } else {
        setIsTyping(true);
        timeout = setTimeout(typeText, 500);
      }
    };

    if (isTyping) {
      typeText();
    }

    return () => clearTimeout(timeout);
  }, [hasStarted, isTyping, loop, text, typingSpeed, deletingSpeed]);

  return (
    <span className={`inline-block ${className}`}>
      {displayText}
      {showCursor && (
        <span className="inline-block ml-0.5 animate-pulse text-[var(--accent)] font-light">
          |
        </span>
      )}
    </span>
  );
};

export default TextType;

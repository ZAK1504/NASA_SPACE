import React from "react";
import { motion } from "framer-motion";

interface AnimatedCharactersProps {
  text: string;
  className?: string;
  delay?: number;
}

export const AnimatedCharacters: React.FC<AnimatedCharactersProps> = ({
  text,
  className = "",
  delay = 0,
}) => {
  // Split into words so complete words never break mid-word across lines
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.8,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, wordIdx) => (
        <span
          key={wordIdx}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={charIdx}
              variants={child}
              style={{
                display: "inline-block",
              }}
            >
              {char}
            </motion.span>
          ))}
          {wordIdx < words.length - 1 && (
            <span style={{ display: "inline-block", whiteSpace: "pre" }}>{" "}</span>
          )}
        </span>
      ))}
    </motion.span>
  );
};

export default AnimatedCharacters;

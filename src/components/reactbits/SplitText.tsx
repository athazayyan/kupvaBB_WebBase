import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface SplitTextProps {
  text: string;
  delay?: number;     // jeda antar huruf
  duration?: number;  // durasi animasi
  className?: string;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  delay = 100,
  duration = 0.6,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const letters = containerRef.current.querySelectorAll("span");
      gsap.fromTo(
        letters,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: delay / 1000,
          duration,
          ease: "power3.out",
        }
      );
    }
  }, [text, delay, duration]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-wrap gap-1 text-3xl font-bold ${className}`}
    >
      {text.split("").map((char, i) => (
        <span key={i} className="inline-block">
          {char}
        </span>
      ))}
    </div>
  );
};

export default SplitText;

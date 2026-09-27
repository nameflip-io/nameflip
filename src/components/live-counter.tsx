"use client";

import { useEffect, useRef, useState } from "react";

const START_COUNT = 2400;
const MIN_INTERVAL_MS = 3000;
const MAX_INTERVAL_MS = 8000;
const MIN_INCREMENT = 1;
const MAX_INCREMENT = 150;

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function LiveCounter() {
  const [count, setCount] = useState(START_COUNT);
  const groupRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
      timeoutId = setTimeout(() => {
        setCount((prev) => prev + randomBetween(MIN_INCREMENT, MAX_INCREMENT));
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    group.classList.remove("is-animating");
    void group.offsetHeight;
    group.classList.add("is-animating");
  }, [count]);

  const digits = count.toLocaleString("en-US").split("");

  return (
    <>
      <span ref={groupRef} className="t-digit-group">
        {digits.map((digit, i) => (
          <span
            key={i}
            className="t-digit"
            data-stagger={i === 0 ? undefined : String(i)}
          >
            {digit}
          </span>
        ))}
      </span>
      <span>+</span>
    </>
  );
}

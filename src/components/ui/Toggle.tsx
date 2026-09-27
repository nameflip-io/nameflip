"use client";
import { useRef } from "react";

interface ToggleProps {
  on: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export function Toggle({ on, onChange, label }: ToggleProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.classList.add("is-init");
    onChange(!on);
  };

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      <button
        ref={btnRef}
        role="switch"
        aria-checked={on}
        data-on={on ? "true" : "false"}
        className="t-toggle"
        onClick={handleClick}
        type="button"
      >
        <span className="t-toggle-thumb" />
      </button>
      {label && <span style={{ fontSize: "14px", color: "#374151" }}>{label}</span>}
    </label>
  );
}

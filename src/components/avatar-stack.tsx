"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const AVATARS = [
  "https://i.pravatar.cc/100?img=1",
  "https://i.pravatar.cc/100?img=3",
  "https://i.pravatar.cc/100?img=5",
  "https://i.pravatar.cc/100?img=7",
  "https://i.pravatar.cc/100?img=12",
  "https://i.pravatar.cc/100?img=15",
  "https://i.pravatar.cc/100?img=22",
  "https://i.pravatar.cc/100?img=25",
];

const HOVER_TRANSITION = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)";
const RESET_TRANSITION = "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const FALLOFF = 0.45;

export function AvatarStack() {
  const groupRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const avatars = avatarRefs.current;

    const handleEnter = (hoveredIndex: number) => () => {
      avatars.forEach((avatar, i) => {
        if (!avatar) return;
        const distance = Math.abs(i - hoveredIndex);
        let translateY: number;
        let scale: number;

        if (distance === 0) {
          translateY = -8;
          scale = 1.15;
        } else {
          const falloff = FALLOFF ** (distance - 1);
          translateY = -4 * falloff;
          scale = 1 + 0.05 * falloff;
        }

        avatar.style.transition = HOVER_TRANSITION;
        avatar.style.transform = `translateY(${translateY}px) scale(${scale})`;
        avatar.style.zIndex = distance === 0 ? "50" : "";
      });
    };

    const handleLeave = () => {
      avatars.forEach((avatar) => {
        if (!avatar) return;
        avatar.style.transition = RESET_TRANSITION;
        avatar.style.transform = "translateY(0px) scale(1)";
        avatar.style.zIndex = "";
      });
    };

    const cleanups: Array<() => void> = [];

    avatars.forEach((avatar, i) => {
      if (!avatar) return;
      const enter = handleEnter(i);
      avatar.addEventListener("mouseenter", enter);
      cleanups.push(() => avatar.removeEventListener("mouseenter", enter));
    });

    group.addEventListener("mouseleave", handleLeave);
    cleanups.push(() => group.removeEventListener("mouseleave", handleLeave));

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div ref={groupRef} className="flex items-center">
      {AVATARS.map((src, i) => (
        <div
          key={src}
          ref={(el) => {
            avatarRefs.current[i] = el;
          }}
          className="t-avatar relative shrink-0 rounded-full"
          style={{ marginLeft: i === 0 ? 0 : "-12px" }}
        >
          <Image
            src={src}
            alt=""
            width={40}
            height={40}
            className="box-border size-10 rounded-full border-2 object-cover shadow-sm"
            style={{ borderColor: "#FFFFFF" }}
          />
        </div>
      ))}
    </div>
  );
}

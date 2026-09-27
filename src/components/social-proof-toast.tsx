"use client";

import { useEffect, useRef, useState } from "react";

interface Notification {
  name: string;
  action: string;
  time: string;
  avatarBg: string;
}

const NOTIFICATIONS: Notification[] = [
  {
    name: "Marcus T.",
    action: "Just flipped aitools.io for $1,200 profit 🔥",
    time: "2 min ago",
    avatarBg: "#2563EB",
  },
  {
    name: "Sarah K.",
    action: "Found a domain worth $3,400 for $12 🎯",
    time: "5 min ago",
    avatarBg: "#10B981",
  },
  {
    name: "James R.",
    action: "Portfolio up 180% this week 📈",
    time: "8 min ago",
    avatarBg: "#F59E0B",
  },
  {
    name: "Erik L.",
    action: "Registered cryptopulse.io — already got $800 offer",
    time: "11 min ago",
    avatarBg: "#6366F1",
  },
  {
    name: "Nina V.",
    action: "Daily Top 10 found me a $2,100 domain today",
    time: "14 min ago",
    avatarBg: "#EC4899",
  },
  {
    name: "Tom B.",
    action: "Sold fittrack.co for $340 after 3 days 💰",
    time: "17 min ago",
    avatarBg: "#10B981",
  },
  {
    name: "Anna M.",
    action: "AI score saved me from buying a spam domain 🙏",
    time: "21 min ago",
    avatarBg: "#2563EB",
  },
  {
    name: "Ryan C.",
    action: "Made $2,800 flipping 3 domains this month",
    time: "25 min ago",
    avatarBg: "#F59E0B",
  },
  {
    name: "Lisa P.",
    action: "novaai.io just sold on Flippa for $4,500 🚀",
    time: "31 min ago",
    avatarBg: "#6366F1",
  },
  {
    name: "David S.",
    action: "Found my startup domain in 10 minutes ✅",
    time: "35 min ago",
    avatarBg: "#EC4899",
  },
];

const VISIBLE_DURATION = 4000;
const FADE_DURATION = 400;
const GAP_DURATION = 2000;

function shuffle(indices: number[]) {
  const result = [...indices];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SocialProofToast() {
  const [index, setIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const queueRef = useRef<number[]>([]);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNext = () => {
      if (queueRef.current.length === 0) {
        queueRef.current = shuffle(NOTIFICATIONS.map((_, i) => i));
      }
      const nextIndex = queueRef.current.shift()!;
      setIndex(nextIndex);
      setVisible(true);

      timeouts.push(
        setTimeout(() => {
          setVisible(false);
          timeouts.push(setTimeout(showNext, FADE_DURATION + GAP_DURATION));
        }, VISIBLE_DURATION)
      );
    };

    timeouts.push(setTimeout(showNext, 0));

    return () => timeouts.forEach(clearTimeout);
  }, [active]);

  const isShown = active && visible;
  const notification = index === null ? null : NOTIFICATIONS[index];

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-6 z-[9999] hidden w-[300px] rounded-[12px] bg-white py-3.5 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-[400ms] ease-out sm:block ${
        isShown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-[10px] opacity-0"
      }`}
    >
      {notification && (
        <>
          <span className="absolute right-3 top-3 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#10B981]" />
          </span>

          <div className="flex items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: notification.avatarBg }}
            >
              {getInitials(notification.name)}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-sm leading-snug text-foreground">
                <span className="font-semibold">{notification.name}</span>{" "}
                {notification.action}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {notification.time}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

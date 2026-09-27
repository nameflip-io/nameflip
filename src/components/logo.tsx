export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <img
      src="/nameflip.com.svg"
      alt="NameFlip"
      className={size === "sm" ? "h-8 w-auto" : "h-10 w-auto"}
    />
  );
}

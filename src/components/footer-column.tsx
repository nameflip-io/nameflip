"use client";

export function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p
        className="uppercase"
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#9CA3AF",
          marginBottom: 16,
        }}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              onClick={(event) => {
                if (link.href.startsWith("#") && link.href !== "#") {
                  event.preventDefault();
                  document
                    .getElementById(link.href.slice(1))
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="no-underline transition-colors hover:text-[#0F172A]"
              style={{ fontSize: 14, color: "#6B7280" }}
            >
              <span style={{ color: "#9CA3AF" }}>›</span> {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

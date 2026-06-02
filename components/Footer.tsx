"use client";

const LINKS = {
  Main: [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact Us", href: "#contact" },
  ],
  Legal: [
    { label: "Legal Center", href: "#legal" },
    { label: "Terms of Use", href: "#terms" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Cookie Policy", href: "#cookies" },
  ],
};

const SOCIAL = [
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="px-6 pt-16 pb-10"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded-sm"
                style={{
                  background: "linear-gradient(135deg, #6EE7FF 0%, #3b82f6 100%)",
                }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "#F5F5F5", letterSpacing: "-0.02em" }}
              >
                SpyCraft
              </span>
            </a>
            <p
              className="text-xs leading-relaxed max-w-xs"
              style={{ color: "rgba(245,245,245,0.3)" }}
            >
              Autopilot Your Creative Marketing.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p
                className="text-xs font-medium mb-4 uppercase tracking-wider"
                style={{ color: "rgba(245,245,245,0.3)" }}
              >
                {group}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "rgba(245,245,245,0.45)" }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.8)")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.45)")
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div>
            <p
              className="text-xs font-medium mb-4 uppercase tracking-wider"
              style={{ color: "rgba(245,245,245,0.3)" }}
            >
              Social
            </p>
            <ul className="space-y-3">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="flex items-center gap-2 text-sm transition-colors duration-200"
                    style={{ color: "rgba(245,245,245,0.45)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(245,245,245,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(245,245,245,0.45)";
                    }}
                  >
                    {s.icon}
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="text-xs" style={{ color: "rgba(245,245,245,0.2)" }}>
            © {new Date().getFullYear()} Adden Inc. All rights reserved.
          </p>
          <a
            href="#contact"
            className="text-xs transition-colors duration-200"
            style={{ color: "rgba(245,245,245,0.3)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.6)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.3)")}
          >
            Ask About SpyCraft
          </a>
        </div>
      </div>
    </footer>
  );
}

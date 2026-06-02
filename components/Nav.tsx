"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "MCP", href: "#mcp" },
  { label: "Blog", href: "#blog" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{
        background: scrolled
          ? "rgba(4, 4, 4, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 relative">
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                background: "linear-gradient(135deg, #6EE7FF 0%, #3b82f6 100%)",
                opacity: 0.9,
              }}
            />
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)",
              }}
            />
          </div>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "#F5F5F5", letterSpacing: "-0.02em" }}
          >
            SpyCraft
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm transition-colors duration-200"
              style={{ color: "rgba(245,245,245,0.5)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.5)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#login"
            className="text-sm px-4 py-2 rounded-md transition-colors duration-200"
            style={{ color: "rgba(245,245,245,0.5)" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#F5F5F5")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.5)")
            }
          >
            Login
          </a>
          <a
            href="#demo"
            className="text-sm px-4 py-2 rounded-md transition-all duration-200"
            style={{
              color: "#040404",
              background: "rgba(245,245,245,0.92)",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#F5F5F5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(245,245,245,0.92)";
            }}
          >
            Book a demo
          </a>
          <a
            href="#trial"
            className="text-sm px-4 py-2 rounded-md transition-all duration-200"
            style={{
              color: "#040404",
              background: "#6EE7FF",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#a5f0ff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#6EE7FF";
            }}
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-px transition-all duration-300"
              style={{ background: "rgba(245,245,245,0.7)" }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 pt-4 pb-6 border-t flex flex-col gap-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm px-2"
              style={{ color: "rgba(245,245,245,0.6)" }}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 mt-2 px-2">
            <a
              href="#demo"
              className="flex-1 text-center text-sm py-2.5 rounded-md font-medium"
              style={{ color: "#040404", background: "rgba(245,245,245,0.9)" }}
            >
              Book a demo
            </a>
            <a
              href="#trial"
              className="flex-1 text-center text-sm py-2.5 rounded-md font-medium"
              style={{ color: "#040404", background: "#6EE7FF" }}
            >
              Start Free Trial
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

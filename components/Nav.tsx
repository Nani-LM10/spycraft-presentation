"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Nav() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY < lastY || window.scrollY < 80);
      setLastY(window.scrollY);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [lastY]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -16 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: "linear-gradient(135deg, #FFB060 0%, #FF4810 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            }}
          />
        </div>
        <span
          style={{
            color: "#FF8AFF",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
          }}
        >
          SpyCraft
        </span>
      </a>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Product", "Docs", "Pricing"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            style={{
              color: "rgba(255,138,255,0.4)",
              fontSize: "0.8rem",
              textDecoration: "none",
              transition: "color 0.2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.85)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(245,245,245,0.4)")
            }
          >
            {label}
          </a>
        ))}
        <a
          href="#trial"
          style={{
            color: "#040404",
            background: "#FF8030",
            fontSize: "0.8rem",
            fontWeight: 500,
            padding: "6px 16px",
            borderRadius: 6,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FFB060";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FF8030";
          }}
        >
          Get started
        </a>
      </div>
    </motion.nav>
  );
}

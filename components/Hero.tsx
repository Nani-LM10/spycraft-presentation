"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const NetworkScene = dynamic(() => import("./NetworkScene"), { ssr: false });

const STATS = [
  { value: "180+", label: "creative variations/month" },
  { value: "80%", label: "Faster fatigue-to-live" },
  { value: "2.5x", label: "Improvement in ROAS" },
  { value: "$120M+", label: "Monthly Ad Spend Monitored" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* WebGL Background */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <NetworkScene />
        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, #040404 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{
            background: "linear-gradient(to bottom, transparent, #040404)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to bottom, #040404, transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ zIndex: 1 }}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          {/* Eyebrow badge */}
          <motion.div variants={item} className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
              style={{
                background: "rgba(110,231,255,0.08)",
                border: "1px solid rgba(110,231,255,0.18)",
                color: "#6EE7FF",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#6EE7FF" }}
              />
              AI-Powered Creative Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-semibold leading-none tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.03em",
            }}
          >
            AI-powered insights
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6EE7FF 0%, #93C5FD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              for modern marketers
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(245,245,245,0.5)", fontSize: "1.125rem" }}
          >
            An intelligent workflow for your next winning creative. Your ads
            analysed. Your competitors decoded. Your next winning creative, ready
            before you ask.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
          >
            <CTAButton href="#trial" primary>
              Start free trial
            </CTAButton>
            <CTAButton href="#demo" secondary>
              Book a demo
            </CTAButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col items-center py-6 px-4"
                style={{ background: "rgba(4,4,4,0.6)" }}
              >
                <span
                  className="font-semibold tracking-tight mb-1"
                  style={{
                    fontSize: "1.75rem",
                    color: "#F5F5F5",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs text-center leading-snug"
                  style={{ color: "rgba(245,245,245,0.4)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 1 }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(245,245,245,0.25)" }}
        >
          Scroll
        </span>
        <div
          className="w-px h-12"
          style={{
            background:
              "linear-gradient(to bottom, rgba(110,231,255,0.4), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}

function CTAButton({
  href,
  children,
  primary,
  secondary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200"
      style={
        primary
          ? {
              background: "#6EE7FF",
              color: "#040404",
            }
          : {
              background: "rgba(255,255,255,0.06)",
              color: "#F5F5F5",
              border: "1px solid rgba(255,255,255,0.1)",
            }
      }
      onMouseEnter={(e) => {
        if (primary) {
          (e.currentTarget as HTMLElement).style.background = "#a5f0ff";
        } else {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (primary) {
          (e.currentTarget as HTMLElement).style.background = "#6EE7FF";
        } else {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.06)";
        }
      }}
    >
      {children}
      {primary && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 7h8M7 3l4 4-4 4" />
        </svg>
      )}
    </a>
  );
}

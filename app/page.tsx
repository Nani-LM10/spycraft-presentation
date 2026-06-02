"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import ScrollStory from "@/components/ScrollStory";

const SpaceScene = dynamic(() => import("@/components/SpaceScene"), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ background: "#040404" }}>
      <SpaceScene />
      <Nav />
      <ScrollStory />
    </main>
  );
}

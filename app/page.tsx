import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import BeforeAfter from "@/components/BeforeAfter";
import UseCases from "@/components/UseCases";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <div style={{ background: "#040404", minHeight: "100vh" }}>
        <Nav />
        <Hero />
        <Features />
        <BeforeAfter />
        <UseCases />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </SmoothScroll>
  );
}

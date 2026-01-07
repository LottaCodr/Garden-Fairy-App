import { BestSellers } from "@/components/sections/BestSeller";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { Testimonials } from "@/components/sections/Testimonials";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Hero />
      <BestSellers />
      <Features />
      <Testimonials />
    </main>
  );
}

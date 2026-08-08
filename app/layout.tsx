import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/custom/Toaster";
import { SearchDialog } from "@/components/custom/SearchDialog";

export const metadata: Metadata = {
  title: {
    default: "The Garden Fairy — Plants & Smart Home Planners",
    template: "%s · The Garden Fairy",
  },
  description:
    "Handpicked indoor plants, garden tools and AI-powered space planners. Free delivery on orders over ₦50,000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground antialiased">
        <Header />
        {children}
        <Footer />
        <Toaster />
        <SearchDialog />
      </body>
    </html>
  );
}

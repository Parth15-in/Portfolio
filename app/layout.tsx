import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Parth Patel | Full Stack AI Engineer",
  description:
    "Professional portfolio of Parth Patel — Full Stack AI Engineer with expertise in React.js, Next.js, Node.js, MongoDB, and AI integration. Open to software engineering opportunities.",
  keywords: [
    "Full Stack Developer",
    "AI Engineer",
    "React",
    "Next.js",
    "Node.js",
    "Software Engineer",
    "Pune",
    "India",
    "Parth Patel",
  ],
  authors: [{ name: "Parth Patel", url: "https://github.com/Parth15-in" }],
  openGraph: {
    title: "Parth Patel | Full Stack AI Engineer",
    description:
      "Full Stack AI Engineer with hands-on experience building scalable web applications using React.js, Next.js, Node.js, and MongoDB.",
    type: "website",
    locale: "en_IN",
    siteName: "Parth Patel Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parth Patel | Full Stack AI Engineer",
    description:
      "Full Stack AI Engineer | React.js, Next.js, Node.js, MongoDB, AI Integration",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{ background: "var(--bg)", color: "var(--navy)" }}
      >
        {children}
      </body>
    </html>
  );
}

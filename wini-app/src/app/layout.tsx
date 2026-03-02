import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-cinzel-family",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-family",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WINi — Wine Intelligence",
  description: "Premium AI-powered wine pairing recommendations",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0D0D0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${jost.variable} antialiased`}
      >
        {/* Splash screen — renders in first paint (pre-JS), removed after hydration */}
        <div id="splash-screen" className="splash-screen" aria-hidden="true">
          <div className="splash-glass">
            <svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Glass bowl clip path */}
              <defs>
                <clipPath id="bowl-clip">
                  <path d="M25 30 Q25 85 50 95 Q75 85 75 30 Z" />
                </clipPath>
              </defs>
              {/* Wine fill — clipped to bowl, animated scaleY */}
              <rect
                id="splash-fill-rect"
                x="25" y="30" width="50" height="65"
                fill="#9B2335"
                clipPath="url(#bowl-clip)"
                className="splash-fill"
              />
              {/* Surface highlight — rides up with fill */}
              <line
                id="splash-surface-line"
                x1="32" y1="34" x2="68" y2="34"
                stroke="#C9A84C" strokeWidth="0.8" opacity="0.4"
                clipPath="url(#bowl-clip)"
                className="splash-surface"
              />
              {/* Glass bowl outline */}
              <path
                d="M25 30 Q25 85 50 95 Q75 85 75 30"
                stroke="#FAF6F0" strokeWidth="1.2" opacity="0.7"
                fill="none" strokeLinecap="round"
              />
              {/* Rim */}
              <line x1="22" y1="30" x2="78" y2="30" stroke="#FAF6F0" strokeWidth="1" opacity="0.5" />
              {/* Stem */}
              <line x1="50" y1="95" x2="50" y2="125" stroke="#FAF6F0" strokeWidth="1" opacity="0.5" />
              {/* Base */}
              <line x1="35" y1="125" x2="65" y2="125" stroke="#FAF6F0" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
            </svg>
            <div className="splash-pour" />
            <div className="splash-drip" />
          </div>
          <div className="splash-logo">WIN<i>i</i></div>
          <p className="splash-tagline">Wine Intelligence</p>
        </div>

        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}

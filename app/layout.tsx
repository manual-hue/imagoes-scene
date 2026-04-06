import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Source_Code_Pro, Nanum_Pen_Script } from "next/font/google";
import "@/styles/globals.css";
import { ViewportHeightProvider } from "@/components/ViewportHeightProvider";
import { CRTOverlay } from "@/components/ui/CRTOverlay";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const nanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crime Scene Zero",
  description: "오프라인 추리 게임 PWA",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0C0C0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${sourceCodePro.variable} ${nanumPenScript.variable}`}>
      <body className="font-body antialiased">
        <ViewportHeightProvider />
        <div className="app-viewport">
          <div className="app-frame">{children}</div>
        </div>

        {/* CRT 효과 레이어 (전역) */}
        <CRTOverlay />
      </body>
    </html>
  );
}

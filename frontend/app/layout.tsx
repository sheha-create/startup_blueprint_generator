import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blueprintr — AI Startup Blueprint Generator',
  description: 'Convert your startup idea into a complete business blueprint in seconds. Business Model Canvas, GTM strategy, budget, funding, and legal — all AI-powered.',
  keywords: 'startup, business plan, AI, blueprint, BMC, go-to-market, funding, India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-surface-50 antialiased font-sans">{children}</body>
    </html>
  );
}

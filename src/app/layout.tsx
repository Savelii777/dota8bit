import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dota 8-Bit - A Retro MOBA Game",
  description: "An 8-bit style MOBA game inspired by Dota 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-gray-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}

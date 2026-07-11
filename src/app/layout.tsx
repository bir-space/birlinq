import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "birlinq Move",
  description: "Privacy-first QR platform for car owners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

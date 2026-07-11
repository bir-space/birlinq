import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "birlinq Move — приватная QR-связь для авто",
  description:
    "Privacy-first QR-платформа. Безопасная связь с владельцем авто без раскрытия контактов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <Nav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


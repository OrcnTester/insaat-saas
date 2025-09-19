import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "İnşaat SaaS Demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="tr"><body>{children}</body></html>);
}

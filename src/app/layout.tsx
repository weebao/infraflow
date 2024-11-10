import type { Metadata } from "next";
import { ReactFlowProvider } from "@xyflow/react";
import "./globals.css";
import '@xyflow/react/dist/style.css';

export const metadata: Metadata = {
  title: "Infraflow",
  description: "Simplify infrastructure for everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen">
        <ReactFlowProvider>
          {children}
        </ReactFlowProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ReactFlowProvider } from "@xyflow/react";
import "./globals.css";
import '@xyflow/react/dist/style.css';
import { ProviderProvider } from "@/context/provider-context";

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
          <ProviderProvider>
            {children}
          </ProviderProvider>
        </ReactFlowProvider>
      </body>
    </html>
  );
}

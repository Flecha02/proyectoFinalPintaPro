import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { Navbar } from "../components/layout/Navbar";

export const metadata: Metadata = {
  title: "PintaPro - Sistema de Gestión e Inventario",
  description: "Sistema integral de gestión de productos, inventario, ventas y facturación de PintaPro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased bg-slate-50">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <div className="flex-1 flex flex-col bg-slate-50">
              {children}
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

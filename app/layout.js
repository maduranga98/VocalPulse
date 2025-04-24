import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { AttendanceProvider } from "@/app/context/AttendanceContext";
import { PerformanceProvider } from "@/app/context/PerformanceContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Call Center Management",
  description:
    "Call center management application with Kanban board and attendance tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AttendanceProvider>
            <PerformanceProvider>{children}</PerformanceProvider>
          </AttendanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

"use client"; 

import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <Navbar />
        {children}
      </body>
    </html>
  );
}




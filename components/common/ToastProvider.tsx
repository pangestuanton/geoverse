"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#022c22",
          border: "1px solid #d1fae5",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#ffffff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
        },
      }}
    />
  );
}

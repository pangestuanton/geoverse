"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GeoVerseChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi percakapan pertama kali
  useEffect(() => {
    const greetingName = user?.displayName || "Pengguna";
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setMessages([
        {
          role: "assistant",
          content: `Halo ${greetingName}! Saya GeoVerse Assistant. Ada yang bisa saya bantu terkait geografi, energi panas bumi, pilah sampah, atau seputar platform GeoVerse?`,
        },
      ]);
    });
    return () => {
      active = false;
    };
  }, [user]);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError(null);
    setIsLoading(true);

    // Tambah pesan user ke list
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);

    try {
      // Kirim riwayat percakapan (maksimal 6 pesan terakhir untuk batasi token)
      const chatHistory = updatedMessages.slice(-6);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung ke API route.");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("[Chatbot UI] Error sending message:", err);
      setError("Maaf, GeoVerse Assistant sedang mengalami gangguan. Coba lagi sebentar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* PANEL CHAT WIDGET */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-[360px] sm:w-[380px] h-[520px] bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    GeoVerse Assistant
                  </h3>
                  <span className="text-[10px] text-emerald-100/90 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                    Online | Asisten AI
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/25 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body (Messages) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="text-[10px] font-bold text-emerald-600 mb-1 flex items-center gap-1">
                        <span>assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 max-w-[80%] text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-xs font-medium">Asisten sedang mengetik...</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-2xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer (Input Form) */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder="Tanya geografi, lingkungan, panas bumi..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors ${
          isOpen
            ? "bg-slate-800 text-white shadow-slate-800/10"
            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-emerald-500 animate-pulse"></span>
          </div>
        )}
      </motion.button>
    </div>
  );
}

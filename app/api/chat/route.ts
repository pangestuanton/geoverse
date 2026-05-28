import { type NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah GeoVerse Assistant, asisten AI untuk website GeoVerse. Jawab pertanyaan pengguna dalam bahasa Indonesia dengan gaya ramah, jelas, singkat, dan edukatif. Fokus hanya pada topik GeoVerse, geografi, peta, lingkungan, lokasi, data spasial, dan edukasi spasial. Jika pertanyaan di luar topik, arahkan kembali secara sopan ke topik GeoVerse atau geografi.`;

export async function POST(request: NextRequest) {
  try {
    // 1. Ambil body request
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { reply: "Format pesan tidak valid." },
        { status: 400 }
      );
    }

    const { messages } = body;

    // 2. Validasi pesan terakhir user
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== "string" || !lastMessage.content.trim()) {
      return NextResponse.json(
        { reply: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Batasi panjang input (maksimal 1000 karakter) untuk cegah penyalahgunaan kuota
    if (lastMessage.content.length > 1000) {
      return NextResponse.json(
        { reply: "Pesan terlalu panjang. Maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    // 3. Baca Environment Variables secara aman
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

    if (!apiKey) {
      console.error("[Chat API] OPENROUTER_API_KEY tidak ditemukan di environment variables.");
      return NextResponse.json(
        {
          reply: "Halo! Maaf sekali, GeoVerse Assistant belum dikonfigurasi dengan lengkap oleh Administrator (OPENROUTER_API_KEY belum diisi). Silakan hubungi admin Anda.",
        },
        { status: 200 } // Kembalikan 200 agar UI bisa menampilkan pesan error ini secara ramah
      );
    }

    // 4. Susun payload untuk OpenRouter
    // Menambahkan system prompt di awal riwayat pesan
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    // 5. Kirim request ke OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://geoverse.edu", // Referer opsional untuk OpenRouter rankings
        "X-Title": "GeoVerse",
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Chat API] OpenRouter error response:", response.status, errorData);
      return NextResponse.json(
        {
          reply: "Maaf, GeoVerse Assistant sedang mengalami gangguan saat terhubung ke server AI. Coba lagi sebentar.",
        },
        { status: 200 }
      );
    }

    const responseData = await response.json();
    const replyContent = responseData?.choices?.[0]?.message?.content;

    if (!replyContent) {
      console.error("[Chat API] Respon OpenRouter kosong:", responseData);
      return NextResponse.json(
        { reply: "Maaf, saya tidak menerima jawaban yang valid. Silakan coba lagi." },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply: replyContent });
  } catch (error) {
    console.error("[Chat API] Terjadi kesalahan fatal:", error);
    return NextResponse.json(
      {
        reply: "Maaf, GeoVerse Assistant sedang mengalami gangguan. Coba lagi sebentar.",
      },
      { status: 500 }
    );
  }
}

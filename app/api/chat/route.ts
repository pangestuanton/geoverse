import { type NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah GeoVerse Assistant, asisten AI ramah untuk website GeoVerse.

Peran utamamu adalah membantu pengguna memahami GeoVerse, geografi, peta, lingkungan, energi geothermal, perubahan iklim, data spasial, edukasi lingkungan, serta fitur-fitur yang tersedia di dalam platform GeoVerse.

Namun, kamu juga boleh menjawab pertanyaan umum tentang berbagai topik lain, seperti teknologi, pendidikan, sains, kehidupan sehari-hari, produktivitas, penulisan, ide kreatif, karier, dan pengetahuan umum. Jangan terlalu membatasi percakapan hanya pada GeoVerse. Jika pengguna bertanya hal umum, bantu jawab secara natural dan bermanfaat.

Tetap prioritaskan GeoVerse jika pertanyaan pengguna berkaitan dengan:
- GeoVerse
- Geografi
- Peta dan lokasi
- Lingkungan
- Energi geothermal
- Perubahan iklim
- Data spasial
- Edukasi lingkungan
- Green Log
- Modul pembelajaran GeoVerse
- Fitur-fitur dalam platform GeoVerse

Gunakan bahasa Indonesia yang natural, ramah, dan mudah dipahami. Sesuaikan gaya bicaramu dengan gaya pengguna:
- Jika pengguna menggunakan bahasa formal, jawablah dengan sopan, jelas, dan rapi.
- Jika pengguna menggunakan bahasa santai, gaul, atau kasual, jawablah dengan gaya yang lebih santai, hangat, dan tidak kaku.
- Boleh menggunakan sapaan ringan seperti "Oke", "Siap", "Bisa banget", "Nah", "Mantap", atau "Gas" selama tetap natural.
- Jangan terdengar seperti robot.
- Jangan terlalu panjang jika pertanyaannya sederhana.
- Berikan jawaban singkat, padat, dan langsung membantu.
- Jika pengguna meminta penjelasan detail, barulah berikan jawaban yang lebih lengkap dan terstruktur.

Cara menjawab:
- Untuk pertanyaan tentang GeoVerse/geografi/lingkungan, jawab sebagai asisten edukatif GeoVerse.
- Untuk pertanyaan umum, jawab seperti asisten AI biasa yang ramah dan membantu.
- Jika memungkinkan, hubungkan jawaban umum dengan konteks edukasi, lingkungan, atau GeoVerse secara halus, tetapi jangan dipaksakan.
- Jangan menolak pertanyaan hanya karena tidak berhubungan langsung dengan GeoVerse.
- Jika pengguna hanya ingin ngobrol santai, tanggapi dengan santai dan manusiawi.
- Jika pengguna meminta bantuan menulis, merangkum, membuat ide, menjelaskan konsep, atau menyusun rencana, bantu dengan jelas.

Batasan keamanan tetap berlaku:
- Jangan membantu permintaan yang berbahaya, ilegal, merugikan orang lain, mengandung kekerasan, penipuan, peretasan, eksploitasi, atau penyalahgunaan data.
- Jika pertanyaan sensitif atau berisiko, jawab dengan aman, sopan, dan arahkan ke alternatif yang positif.
- Jangan mengarang fakta. Jika tidak yakin, katakan secara jujur bahwa kamu belum yakin.
- Jangan memberikan informasi pribadi, rahasia, API key, token, atau data sensitif.

Gaya utama:
- Ramah
- Santai
- Cerdas
- Edukatif
- Tidak kaku
- Tidak terlalu membatasi obrolan
- Tetap akurat dan bermanfaat

Contoh:
User: "Bro geothermal itu apaan sih?"
Assistant: "Singkatnya, geothermal itu energi panas bumi. Jadi panas dari dalam bumi dimanfaatkan buat menghasilkan listrik atau kebutuhan energi lain. Di GeoVerse, kamu bisa belajar contohnya lewat kasus Ulubelu biar lebih kebayang."

User: "Bantu bikin caption Instagram dong"
Assistant: "Bisa banget. Mau caption-nya gaya santai, aesthetic, lucu, atau formal? Kalau mau langsung, aku bisa bikinin beberapa versi."

User: "Aku lagi capek banget hari ini"
Assistant: "Wajar banget. Kadang hari emang berat tanpa permisi. Coba ambil jeda sebentar, minum air, tarik napas pelan, terus kerjain satu hal kecil dulu. Nggak harus langsung beres semua."

User: "Apa bedanya cuaca dan iklim?"
Assistant: "Cuaca itu kondisi atmosfer dalam waktu pendek, misalnya hari ini hujan atau panas. Iklim itu pola cuaca jangka panjang di suatu wilayah. Jadi cuaca itu harian, iklim itu kebiasaan jangka panjangnya."`;
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

import { type NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah GeoVerse Assistant, asisten AI ramah untuk website GeoVerse.

Tugas utamamu adalah membantu pengguna memahami GeoVerse, geografi, peta, lingkungan, energi geothermal, perubahan iklim, data spasial, edukasi lingkungan, Green Log, modul pembelajaran, serta fitur-fitur yang tersedia di dalam platform GeoVerse.

Fokus utama percakapan tetap pada:
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

Gunakan bahasa Indonesia yang natural, ramah, jelas, dan mudah dipahami. Sesuaikan gaya bicaramu dengan gaya pengguna:
- Jika pengguna menggunakan bahasa formal, jawablah dengan sopan, jelas, dan rapi.
- Jika pengguna menggunakan bahasa santai, gaul, atau kasual, jawablah dengan gaya yang lebih santai, hangat, dan tidak kaku.
- Boleh menggunakan sapaan ringan seperti "Oke", "Siap", "Bisa banget", "Nah", atau "Mantap" selama tetap natural.
- Jangan terdengar seperti robot.
- Jangan terlalu panjang jika pertanyaannya sederhana.
- Berikan jawaban singkat, padat, dan langsung membantu.
- Jika pengguna meminta penjelasan detail, barulah berikan jawaban yang lebih lengkap dan terstruktur.

Jika pengguna bertanya tentang topik di luar GeoVerse atau geografi:
- Jangan langsung menolak secara kaku.
- Jawab secara singkat jika pertanyaannya umum, aman, dan masih wajar.
- Setelah itu, arahkan kembali dengan halus ke konteks GeoVerse, geografi, lingkungan, edukasi, atau kebiasaan ramah lingkungan.
- Jangan membuka pembahasan terlalu jauh dari peran utama sebagai GeoVerse Assistant.

Jika pengguna curhat ringan:
- Tanggapi dengan empati, hangat, dan singkat.
- Boleh memberi dukungan sederhana yang menenangkan.
- Jangan berperan sebagai psikolog, konselor, dokter, atau ahli kesehatan mental.
- Jika curhat berkaitan dengan stres belajar, lelah, bingung, atau kehilangan motivasi, bantu dengan saran ringan dan arahkan ke langkah kecil yang positif.
- Setelah merespons, boleh mengaitkan secara halus ke aktivitas belajar, Green Log, atau eksplorasi GeoVerse jika relevan.

Jika pengguna bertanya hal yang benar-benar tidak relevan, terlalu jauh dari konteks, berbahaya, ilegal, atau tidak pantas:
- Tolak dengan sopan dan singkat.
- Jangan menggurui.
- Arahkan kembali ke topik GeoVerse, geografi, lingkungan, atau edukasi.

Batasan keamanan:
- Jangan membantu permintaan yang berbahaya, ilegal, merugikan orang lain, mengandung kekerasan, penipuan, peretasan, eksploitasi, atau penyalahgunaan data.
- Jangan memberikan informasi pribadi, rahasia, API key, token, atau data sensitif.
- Jangan mengarang fakta. Jika tidak yakin, katakan dengan jujur bahwa kamu belum yakin.
- Untuk pertanyaan yang membutuhkan data terbaru, sarankan pengguna mengecek sumber resmi.

Gaya utama:
- Ramah
- Santai secukupnya
- Edukatif
- Tidak kaku
- Tetap fokus sebagai asisten GeoVerse
- Singkat, jelas, dan bermanfaat

Contoh:
User: "Bro geothermal itu apaan sih?"
Assistant: "Singkatnya, geothermal itu energi panas bumi. Panas dari dalam bumi dimanfaatkan untuk menghasilkan listrik atau energi lain. Di GeoVerse, kamu bisa belajar contohnya lewat kasus Ulubelu biar lebih kebayang."

User: "Aku bingung mulai belajar dari mana"
Assistant: "Santai, mulai dari modul dasar dulu aja. Kamu bisa pelajari apa itu geothermal, lanjut ke energi dan iklim, lalu coba Green Log biar belajarnya nyambung ke kebiasaan sehari-hari."

User: "Aku lagi capek banget hari ini"
Assistant: "Wajar banget, kadang belajar atau aktivitas harian memang bikin penuh kepala. Coba istirahat sebentar, minum air, lalu mulai lagi dari satu hal kecil dulu. Kalau mau yang ringan, kamu bisa eksplor modul GeoVerse pelan-pelan tanpa harus langsung paham semuanya."

User: "Bantu bikin caption Instagram dong"
Assistant: "Bisa, tapi aku bantu singkat ya. Kalau konteksnya lingkungan atau GeoVerse, caption-nya bisa: 'Langkah kecil hari ini bisa jadi perubahan besar untuk bumi esok hari.'"`

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

import { createClient } from "@supabase/supabase-js";

// ⚠️ HANYA digunakan di server-side (Server Actions, Route Handlers, server components)
// Jangan pernah import file ini di client component!
// Service role key bypass RLS — gunakan dengan hati-hati

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
}

// Jika service key tidak tersedia, kembalikan null (akan fallback ke client biasa)
// Ini penting agar build tidak gagal saat key belum dikonfigurasi
let _adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminSupabase() {
  if (!supabaseServiceKey) {
    // Fallback: gunakan publishable key (masih terikat RLS)
    console.warn(
      "[server-admin] SUPABASE_SERVICE_ROLE_KEY tidak tersedia. Menggunakan publishable key. " +
        "Beberapa operasi admin mungkin gagal karena RLS."
    );
    return createClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
      { auth: { persistSession: false } }
    );
  }

  if (!_adminClient) {
    _adminClient = createClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _adminClient;
}

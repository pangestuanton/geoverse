import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vcaqoepveroxvreswycv.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_J1U0_Z2aDBvBZ50EsGoMtg_N-r4c5vq";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );

"use server";

import { createClient } from "@/utils/supabase/server";

export async function createAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error(error);
    return {
      error: "ユーザー情報の取得に失敗しました",
      supabase: null,
      user: null,
    } as const;
  }

  return { error: null, supabase, user } as const;
}

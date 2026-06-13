"use server";

import { createClient } from "@/lib/supabase/server";

export async function createRecoveryMission(
  userId: string
) {
  const supabase = await createClient();

  const { data: existing } =
    await supabase
      .from("recovery_missions")
      .select("id")
      .eq("user_id", userId)
      .eq("completed", false)
      .maybeSingle();

  if (existing) {
    return;
  }

  await supabase
    .from("recovery_missions")
    .insert({
      user_id: userId,
      mission_type: "checkins",
      target_value: 3,
      expires_at: new Date(
        Date.now() +
          1000 *
            60 *
            60 *
            24 *
            7
      ).toISOString(),
    });
}
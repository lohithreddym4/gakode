"use server";

import { createClient } from "@/lib/supabase/server";

export async function nudgeFriend(
  friendId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      type: "friend_nudge",
      metadata: {
        target_user_id: friendId,
      },
    });
}
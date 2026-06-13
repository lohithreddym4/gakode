"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendFriendRequest(
  addresseeId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.id === addresseeId) {
    return;
  }

  const { data: existing } = await supabase
    .from("friendships")
    .select("id")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return;
  }

  const { error } = await supabase
  .from("friendships")
  .insert({
    requester_id: user.id,
    addressee_id: addresseeId,
    status: "pending",
  });
  await supabase
  .from("activities")
  .insert({
    user_id: user.id,
    type: "friend_request_sent",
    metadata: {
      target_user_id: addresseeId,
    },
  });
  

if (error) {
  if (error.code === "23505") {
    return;
  }

  throw new Error(error.message);
}


}
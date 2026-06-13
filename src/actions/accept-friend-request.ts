"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { unlockAchievement } from "@/lib/achievements";

export async function acceptFriendRequest(
  friendshipId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await supabase
    .from("friendships")
    .update({
      status: "accepted",
    })
    .eq("id", friendshipId)
    .eq("addressee_id", user.id);
    await supabase
  .from("activities")
  .insert({
    user_id: user.id,
    type: "friend_request_accepted",
    metadata: {
      friendship_id: friendshipId,
    },
  });
  const { count } =
  await supabase
    .from("friendships")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "accepted")
    .or(
      `requester_id.eq.${user.id},addressee_id.eq.${user.id}`
    );

if ((count ?? 0) === 1) {
  await unlockAchievement(
    user.id,
    "first_friend"
  );
}
  
    revalidatePath("/friends");
    redirect("/friends");
}
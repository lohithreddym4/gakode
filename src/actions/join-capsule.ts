"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { unlockAchievement } from "@/lib/achievements";

export async function joinCapsule(capsuleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("capsule_members")
    .insert({
      user_id: user.id,
      capsule_id: capsuleId,
    });
    await supabase
  .from("activities")
  .insert({
    user_id: user.id,
    type: "join_capsule",
    metadata: {
      capsule_id: capsuleId,
    },
  });
  await unlockAchievement(
    user.id,
    "capsule_member"
  );
  await supabase.from("activities").insert({
    user_id: user.id,
    type: "join_capsule",
    metadata: {
      capsule_id: capsuleId,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard");
}
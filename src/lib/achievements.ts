import { createClient } from "@/lib/supabase/server";

export async function unlockAchievement(
  userId: string,
  code: string
) {
  const supabase = await createClient();

  const { data: achievement } =
    await supabase
      .from("achievements")
      .select("id")
      .eq("code", code)
      .single();
      await supabase
      .from("activities")
      .insert({
        user_id: userId,
        type: "achievement_unlocked",
        metadata: {
          achievement: code,
        },
      });
  if (!achievement) {
    return;
  }

  await supabase
    .from("user_achievements")
    .upsert({
      user_id: userId,
      achievement_id: achievement.id,
    });
}
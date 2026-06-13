"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateStreak } from "@/lib/streak";
import { unlockAchievement } from "@/lib/achievements";

export async function checkInToday() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { error } = await supabase
    .from("checkins")
    .insert({
      user_id: user.id,
      checkin_date: today,
    });

  if (error) {
    throw new Error(error.message);
  }
  

  // Activity: Check In
  await supabase.from("activities").insert({
    user_id: user.id,
    type: "checkin",
    metadata: {},
  });

  // Calculate streak
  const { data: checkins } = await supabase
    .from("checkins")
    .select("checkin_date")
    .eq("user_id", user.id)
    .order("checkin_date");
    const totalCheckins =
  checkins?.length ?? 0;

if (totalCheckins === 1) {
  await unlockAchievement(
    user.id,
    "first_checkin"
  );
}

  const streak = calculateStreak(
    checkins?.map((c) => c.checkin_date) ?? []
  );

  // Activity: Milestones
  const milestones = [
    7,
    30,
    60,
    90,
    180,
    365,
  ];
  if (streak.currentStreak >= 7) {
    await unlockAchievement(
      user.id,
      "streak_7"
    );
  }
  
  if (streak.currentStreak >= 30) {
    await unlockAchievement(
      user.id,
      "streak_30"
    );
  }

  if (
    milestones.includes(
      streak.currentStreak
    )
  ) {
    await supabase
      .from("activities")
      .insert({
        user_id: user.id,
        type: "streak_milestone",
        metadata: {
          streak:
            streak.currentStreak,
        },
      });
  }

  // Challenge Progress
  const {
    data: challengeParticipants,
  } = await supabase
    .from(
      "challenge_participants"
    )
    .select(`
      id,
      progress,
      completed,
      challenge_id,
      challenges (
        id,
        title,
        target_value
      )
    `)
    .eq("user_id", user.id)
    .eq("completed", false);

  for (const participant of challengeParticipants ??
    []) {
    const challenge =
      participant.challenges as {
        id: string;
        title: string;
        target_value: number;
      };

    const nextProgress =
      participant.progress + 1;

    const completed =
      nextProgress >=
      challenge.target_value;

    await supabase
      .from(
        "challenge_participants"
      )
      .update({
        progress: nextProgress,
        completed,
      })
      .eq("id", participant.id);

    if (completed) {
      await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          type: "challenge_completed",
          metadata: {
            challenge_id:
              challenge.id,
            challenge_title:
              challenge.title,
          },
        });
    }
    const { data: mission } =
  await supabase
    .from("recovery_missions")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", false)
    .maybeSingle();
  if (mission) {
    const nextProgress =
      mission.progress + 1;
  
    const completed =
      nextProgress >=
      mission.target_value;
  
    await supabase
      .from("recovery_missions")
      .update({
        progress: nextProgress,
        completed,
      })
      .eq("id", mission.id);
  
    if (completed) {
      await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          type: "recovery_completed",
          metadata: {},
        });
    }
  }

  return true;
}
}

import { createClient } from "@/lib/supabase/server";

export default async function ActivityFeed() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("activities")
    .select(
      `
      id,
      type,
      metadata,
      created_at,
      profiles (
        username
      )
    `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-4 text-2xl font-bold">Activity Feed</h2>

      <div className="space-y-3">
        {data?.map((activity: any) => {
          const username = activity.profiles?.username ?? "Unknown";

          let text = "";

          switch (activity.type) {
            case "checkin":
              text = `${username} checked in today 🔥`;
              break;

            case "streak_milestone":
              text = `${username} reached ${activity.metadata?.streak} days 🔥`;
              break;

            case "join_capsule":
              text = `${username} joined a capsule 📦`;
              break;

            case "friend_nudge":
              text = `${username} nudged a friend 👊`;
              break;

            case "challenge_completed":
              text = `${username} completed a challenge 🏆`;
              break;

            case "recovery_completed":
              text = `${username} recovered a streak 🔥`;
              break;
            case "achievement_unlocked":
              text = `${username} unlocked an achievement 🏅`;
              break;

            default:
              return null;
          }

          return (
            <div key={activity.id} className="rounded border p-3">
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

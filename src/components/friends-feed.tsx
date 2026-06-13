import { createClient } from "@/lib/supabase/server";

export default async function FriendsFeed() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friendIds =
    friendships?.map((friendship) =>
      friendship.requester_id === user.id
        ? friendship.addressee_id
        : friendship.requester_id
    ) ?? [];

  if (!friendIds.length) {
    return (
      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-2xl font-bold">Friends Feed</h2>

        <p>No activity yet.</p>
      </div>
    );
  }

  const { data: activities } = await supabase
    .from("activities")
    .select(
      `
      id,
      type,
      metadata,
      created_at,
      user_id,
      profiles (
        username
      )
    `
    )
    .in("user_id", friendIds)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-4 text-2xl font-bold">Friends Feed</h2>

      <div className="space-y-3">
      {activities?.map((activity: any) => {
  const username =
    activity.profiles?.username ??
    "Unknown";

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

    default:
      return null;
  }

  return (
    <div
      key={activity.id}
      className="rounded border p-3"
    >
      {text}
    </div>
  );
})}
      </div>
    </div>
  );
}

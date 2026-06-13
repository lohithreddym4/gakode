import { createClient } from "@/lib/supabase/server";
import { nudgeFriend } from "@/actions/nudge-friend";

export default async function AccountabilityCard() {
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
    .or(
      `requester_id.eq.${user.id},addressee_id.eq.${user.id}`
    );

  const friendIds =
    friendships?.map((friendship) =>
      friendship.requester_id === user.id
        ? friendship.addressee_id
        : friendship.requester_id
    ) ?? [];

  if (!friendIds.length) {
    return (
      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-2xl font-bold">
          Accountability
        </h2>

        <p>No friends yet.</p>
      </div>
    );
  }

  const { data: friends } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", friendIds);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data: todaysCheckins } =
    await supabase
      .from("checkins")
      .select("user_id")
      .eq("checkin_date", today)
      .in("user_id", friendIds);

  const checkedInUsers = new Set(
    todaysCheckins?.map(
      (checkin) => checkin.user_id
    ) ?? []
  );

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Accountability
      </h2>

      <div className="space-y-3">
        {friends?.map((friend) => {
          const active =
            checkedInUsers.has(friend.id);

          return (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <span>
                {friend.username}
              </span>

              <span>
                {active
                  ? "✅ Active"
                  : <form
                  action={async () => {
                    "use server";
                    await nudgeFriend(friend.id);
                  }}
                >
                  <button className="rounded border px-3 py-1">
                    👊 Nudge
                  </button>
                </form>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
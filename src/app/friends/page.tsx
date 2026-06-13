import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { acceptFriendRequest } from "@/actions/accept-friend-request";
import { buildFriendsLeaderboard } from "@/lib/friends-leaderboard";

export default async function FriendsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: requests } = await supabase
    .from("friendships")
    .select(`
      id,
      requester_id,
      profiles!friendships_requester_id_fkey (
        username
      )
    `)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

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

  const { data: friends } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", friendIds);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .neq("id", user.id)
    .order("username");

  const leaderboardIds = [
    user.id,
    ...friendIds,
  ];

  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .in("user_id", leaderboardIds);

  const leaderboardUsers = [
    {
      id: user.id,
      username: "You",
    },
    ...(friends ?? []),
  ];

  const leaderboard =
    buildFriendsLeaderboard(
      leaderboardUsers,
      checkins ?? []
    );

  return (
    <main className="mx-auto max-w-4xl p-10">
      <h1 className="mb-8 text-4xl font-bold">
        Friends
      </h1>

      <div className="mb-10 rounded-xl border p-6">
        <h2 className="mb-4 text-2xl font-bold">
          🏆 Friends Leaderboard
        </h2>

        <div className="space-y-3">
          {leaderboard.map(
            (friend, index) => (
              <div
                key={friend.id}
                className="flex justify-between rounded border p-3"
              >
                <span>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`}{" "}
                  {friend.username}
                </span>

                <span>
                  🔥 {friend.streak}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          Friends
        </h2>

        <div className="space-y-3">
          {friends?.length ? (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="rounded border p-4"
              >
                {friend.username}
              </div>
            ))
          ) : (
            <p>No friends yet.</p>
          )}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          Pending Requests
        </h2>

        <div className="space-y-3">
          {requests?.length ? (
            requests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded border p-4"
              >
                <span>
                  {request.profiles?.username}
                </span>

                <form
                  action={async () => {
                    "use server";
                    await acceptFriendRequest(
                      request.id
                    );
                  }}
                >
                  <button
                    type="submit"
                    className="rounded bg-black px-4 py-2 text-white"
                  >
                    Accept
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-bold">
        Find Friends
      </h2>

      <div className="space-y-3">
        {profiles?.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between rounded border p-4"
          >
            <span>{profile.username}</span>

            <Link
              href={`/profile/${profile.username}`}
              className="rounded border px-4 py-2"
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
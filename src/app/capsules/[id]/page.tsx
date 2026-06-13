import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildLeaderboard } from "@/lib/leaderboard";

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: capsule } = await supabase
    .from("capsules")
    .select("*")
    .eq("id", id)
    .single();

  if (!capsule) {
    notFound();
  }

  const { data: members } = await supabase
    .from("capsule_members")
    .select(
      `
      user_id,
      profiles (
        username
      )
    `
    )
    .eq("capsule_id", id);

    

  const memberIds = members?.map((m) => m.user_id) ?? [];

  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .in("user_id", memberIds);
  const leaderboard = buildLeaderboard(members ?? [], checkins ?? []);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const rank =
  leaderboard.findIndex(
    (entry) => entry.userId === user?.id
  ) + 1;

  return (
    <main className="mx-auto max-w-4xl p-10">

      <h1 className="mb-8 text-4xl font-bold">{capsule.name}</h1>
      <div className="mb-6 rounded-xl border p-6">
  <h2 className="text-xl font-semibold">
    Your Rank
  </h2>

  <p className="mt-2 text-4xl font-bold">
    #{rank}
  </p>
</div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-2xl font-bold">Members</h2>

        <div className="space-y-2">
          {members?.length ? (
            members.map((member: any, index) => (
              <div key={member.user_id} className="rounded border p-3">
                {index + 1}. {member.profiles?.username ?? "Unknown User"}
              </div>
            ))
          ) : (
            <p>No members yet.</p>
          )}
        </div>
        <div className="mt-8 rounded-xl border p-6">
          <h2 className="mb-4 text-2xl font-bold">🏆 Leaderboard</h2>

          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={user.userId}
                className="flex justify-between rounded border p-3">
                <span>
                {
  index === 0
    ? "🥇"
    : index === 1
    ? "🥈"
    : index === 2
    ? "🥉"
    : `#${index + 1}`
} {user.username}
                </span>

                <span>🔥 {user.streak}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

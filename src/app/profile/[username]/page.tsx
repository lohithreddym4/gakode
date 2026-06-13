import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { sendFriendRequest } from "@/actions/send-friend-request";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: friendship } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  const { data: achievements } = await supabase
    .from("user_achievements")
    .select(`
      unlocked_at,
      achievements (
        id,
        code,
        title,
        description,
        icon
      )
    `)
    .eq("user_id", profile.id);

  const addFriend = async () => {
    "use server";
    await sendFriendRequest(profile.id);
  };

  const isOwnProfile = user.id === profile.id;

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-4xl font-bold">
        {profile.username}
      </h1>

      {!isOwnProfile && (
        <>
          {!friendship ? (
            <form action={addFriend}>
              <button
                type="submit"
                className="mt-6 rounded bg-black px-4 py-2 text-white"
              >
                Add Friend
              </button>
            </form>
          ) : friendship.status === "pending" ? (
            <div className="mt-6 font-medium">
              ⏳ Request Pending
            </div>
          ) : (
            <div className="mt-6 font-medium">
              ✅ Friends
            </div>
          )}
        </>
      )}

      <div className="mt-10 rounded-xl border p-6">
        <h2 className="mb-4 text-2xl font-bold">
          Achievements
        </h2>

        {achievements?.length ? (
          <div className="grid gap-3">
            {achievements.map(
              (item: any) => (
                <div
                  key={
                    item.achievements.id
                  }
                  className="rounded border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {
                        item
                          .achievements
                          .icon
                      }
                    </span>

                    <div>
                      <h3 className="font-semibold">
                        {
                          item
                            .achievements
                            .title
                        }
                      </h3>

                      <p className="text-sm text-gray-500">
                        {
                          item
                            .achievements
                            .description
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500">
            No achievements unlocked
            yet.
          </p>
        )}
      </div>
    </main>
  );
}
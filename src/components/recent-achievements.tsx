import { createClient } from "@/lib/supabase/server";

export default async function RecentAchievements() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("user_achievements")
    .select(`
      unlocked_at,
      achievements (
        title,
        icon
      )
    `)
    .eq("user_id", user.id)
    .order("unlocked_at", {
      ascending: false,
    })
    .limit(5);

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Recent Achievements
      </h2>

      <div className="space-y-2">
        {data?.length ? (
          data.map((item: any) => (
            <div
              key={`${item.unlocked_at}`}
              className="rounded border p-3"
            >
              {item.achievements.icon}{" "}
              {item.achievements.title}
            </div>
          ))
        ) : (
          <p>No achievements yet.</p>
        )}
      </div>
    </div>
  );
}
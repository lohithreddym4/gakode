import { createClient } from "@/lib/supabase/server";

export default async function RecoveryCard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: mission } =
    await supabase
      .from("recovery_missions")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .maybeSingle();

  if (!mission) {
    return null;
  }

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Recovery Mission
      </h2>

      <p>
        Complete{" "}
        {mission.target_value} check-ins
        to recover your streak.
      </p>

      <div className="mt-4">
        {mission.progress}/
        {mission.target_value}
      </div>
    </div>
  );
}
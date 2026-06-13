import { redirect } from "next/navigation";
import RecoveryCard from "@/components/recovery-card";
import CheckInButton from "@/components/checkin-button";
import { calculateStreak } from "@/lib/streak";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ActivityFeed from "@/components/activity-feed";
import FriendsFeed from "@/components/friends-feed";
import AccountabilityCard from "@/components/accountability-card";
import RecentAchievements from "@/components/recent-achievements";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: checkins } = await supabase
    .from("checkins")
    .select("checkin_date")
    .eq("user_id", user.id)
    .order("checkin_date");

  const { data: membership } = await supabase
    .from("capsule_members")
    .select(
      `
    capsule_id,
    capsules (
      name
    )
  `
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const dates = checkins?.map((item) => item.checkin_date) ?? [];

  const streak = calculateStreak(dates);

  const today = new Date().toISOString().split("T")[0];

  const checkedToday = dates.includes(today);

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="mb-8 text-4xl font-bold">CodeArena 🔥</h1>
      <div className="mb-8 flex gap-4">
  <Link href="/capsules">
    Capsules
  </Link>

  <Link href="/friends">
    Friends
  </Link>

  <Link href="/challenges">
    Challenges
  </Link>
</div>
      <div className="mb-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Your Capsule</h2>

        {membership ? (
          <p className="mt-2 text-2xl font-bold">
            {typeof membership.capsules === "object" &&
            membership.capsules !== null &&
            "name" in membership.capsules
              ? membership.capsules.name
              : "Unknown Capsule"}
          </p>
        ) : (
          <Link href="/capsules" className="mt-2 inline-block text-blue-500">
            Join a Capsule
          </Link>
        )}
      </div>

      <div className="mb-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Current Streak</h2>

        <p className="mt-2 text-4xl font-bold">🔥 {streak.currentStreak}</p>
      </div>

      <div className="mb-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Longest Streak</h2>

        <p className="mt-2 text-4xl font-bold">🏆 {streak.longestStreak}</p>
      </div>
      <div className="mb-6">
  <RecentAchievements />
</div>

      <div className="rounded-xl border p-6">
        {checkedToday ? (
          <p className="font-medium">✅ Checked in today</p>
        ) : (
          <CheckInButton />
        )}
      </div>
      <div className="mt-8">
  <RecoveryCard />
</div>

<div className="mt-8">
  <AccountabilityCard />
</div>

<div className="mt-8">
  <FriendsFeed />
</div>

<div className="mt-8">
  <ActivityFeed />
</div>
    </main>
  );
}

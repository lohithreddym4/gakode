import { calculateStreak } from "./streak";

export function buildLeaderboard(
  members: any[],
  checkins: any[]
) {
  return members
    .map((member) => {
      const dates = checkins
        .filter(
          (c) => c.user_id === member.user_id
        )
        .map((c) => c.checkin_date);

      const streak = calculateStreak(dates);

      return {
        userId: member.user_id,
        username:
          member.profiles?.username ??
          "Unknown",
        streak: streak.currentStreak,
      };
    })
    .sort((a, b) => b.streak - a.streak);
}
import { calculateStreak } from "./streak";

export function buildFriendsLeaderboard(
  users: any[],
  checkins: any[]
) {
  return users
    .map((user) => {
      const dates = checkins
        .filter(
          (c) => c.user_id === user.id
        )
        .map((c) => c.checkin_date);

      const streak =
        calculateStreak(dates);

      return {
        id: user.id,
        username: user.username,
        streak: streak.currentStreak,
      };
    })
    .sort(
      (a, b) => b.streak - a.streak
    );
}
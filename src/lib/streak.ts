export function calculateStreak(dates: string[]) {
    if (!dates.length) {
      return {
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  
    const sorted = [...dates].sort();
  
    let longest = 1;
    let running = 1;
  
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
  
      const diff =
        (curr.getTime() - prev.getTime()) /
        (1000 * 60 * 60 * 24);
  
      if (diff === 1) {
        running++;
        longest = Math.max(longest, running);
      } else {
        running = 1;
      }
    }
  
    let current = 1;
  
    for (let i = sorted.length - 1; i > 0; i--) {
      const curr = new Date(sorted[i]);
      const prev = new Date(sorted[i - 1]);
  
      const diff =
        (curr.getTime() - prev.getTime()) /
        (1000 * 60 * 60 * 24);
  
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  
    return {
      currentStreak: current,
      longestStreak: longest,
    };
  }
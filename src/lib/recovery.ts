export function shouldCreateRecoveryMission(
    dates: string[]
  ) {
    if (!dates.length) {
      return false;
    }
  
    const latest = new Date(
      dates[dates.length - 1]
    );
  
    const yesterday = new Date();
    yesterday.setDate(
      yesterday.getDate() - 1
    );
  
    return (
      latest.toISOString().split("T")[0] !==
      yesterday
        .toISOString()
        .split("T")[0]
    );
  }
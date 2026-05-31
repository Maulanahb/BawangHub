// Helper for gamification points
export const getUserPoints = (userId: string) => {
  if (userId === "bawang-bot") return 0;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 900) + 100; // 100 to 1000 points
};

export const isExpert = (points: number) => points >= 500;

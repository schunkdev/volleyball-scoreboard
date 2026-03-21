export type TeamId = "A" | "B";

export type CompletedSet = {
  a: number;
  b: number;
};

export type HistoryEntry = {
  scoreA: number;
  scoreB: number;
  setsWonA: number;
  setsWonB: number;
  isSwapped: boolean;
  completedSets: CompletedSet[];
};

export type TeamView = {
  id: TeamId;
  name: string;
  score: number;
  setsWon: number;
  label: string;
  color: "primary" | "secondary";
};

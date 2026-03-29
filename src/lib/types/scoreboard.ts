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

/** Serializable snapshot synced to Firebase for live sessions */
export type LiveScoreboardState = {
  scoreA: number;
  scoreB: number;
  setsWonA: number;
  setsWonB: number;
  nameA: string;
  nameB: string;
  isSwapped: boolean;
  completedSets: CompletedSet[];
  gameMode: boolean;
  unlimitedSets: boolean;
  themeId: string;
  /** Normalized `#rrggbb` or empty string = use theme default for that side */
  teamColorA: string;
  teamColorB: string;
};

export type LiveSessionPublicRecord = {
  state: LiveScoreboardState;
  isLive: boolean;
  createdAt: number;
  updatedAt: number;
  lastHeartbeatAt: number;
  expiresAt: number;
};

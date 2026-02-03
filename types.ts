
export interface GameState {
  cash: number;
  brand: number;
  stage: number;
  status: 'playing' | 'won' | 'lost';
  logs: LogEntry[];
  isThinking: boolean;
  consultantMessage: string;
}

export interface LogEntry {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: string;
}

export enum GameStage {
  POSITIONING = 1,
  OFFER = 2,
  MESSAGING = 3,
  CONTENT = 4,
  HUNT = 5,
  FORTRESS = 6,
  HIRING = 7,
  CLOSE = 8
}

export interface ValueEquation {
  dream: number;
  likelihood: number;
  timeDelay: number;
  effort: number;
}

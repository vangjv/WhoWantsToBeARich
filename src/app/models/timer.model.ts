/**
 * Countdown timer state (question timer or phone a friend timer)
 */
export interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
}

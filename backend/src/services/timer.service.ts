/**
 * Server-authoritative timer service
 * Prevents client-side time manipulation
 */
export const timerService = {
  /**
   * Get current server time
   */
  getServerTime(): Date {
    return new Date();
  },

  /**
   * Calculate remaining time for a test attempt
   */
  getRemainingTime(startedAt: Date, durationMinutes: number): number {
    const now = new Date();
    const startTime = new Date(startedAt);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    
    const remaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
    return Math.max(0, remaining); // Return 0 if time is up
  },

  /**
   * Check if test time has expired
   */
  isTimeExpired(startedAt: Date, durationMinutes: number): boolean {
    return this.getRemainingTime(startedAt, durationMinutes) === 0;
  },

  /**
   * Calculate time taken
   */
  getTimeTaken(startedAt: Date, submittedAt?: Date): number {
    const start = new Date(startedAt);
    const end = submittedAt ? new Date(submittedAt) : new Date();
    
    return Math.floor((end.getTime() - start.getTime()) / 1000);
  },

  /**
   * Format time as MM:SS
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format time as HH:MM:SS
   */
  formatTimeDetailed(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Sync client time with server time
   * Returns time offset in milliseconds
   */
  calculateTimeOffset(clientTime: Date): number {
    const serverTime = new Date();
    return serverTime.getTime() - new Date(clientTime).getTime();
  }
};

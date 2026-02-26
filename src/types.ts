export interface AuthUser {
  password: string;
  passwordChangedAt?: Date;
  passwordHistory?: string[];
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  [key: string]: any;
}

export interface SecurityConfig {
  passwordExpiryDays?: number;
  passwordHistoryLimit?: number;
  maxFailedAttempts?: number;
  lockoutDurationMinutes?: number;
}

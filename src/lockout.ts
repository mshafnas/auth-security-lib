import { AuthUser, SecurityConfig } from "./types";

const defaultConfig: Required<SecurityConfig> = {
  passwordExpiryDays: 90,
  passwordHistoryLimit: 3,
  maxFailedAttempts: 3,
  lockoutDurationMinutes: 30,
};

class LockoutSecurity {
  private config: Required<SecurityConfig>;

  constructor(config?: SecurityConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  setConfig(newConfig: SecurityConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  isAccountLocked(user: AuthUser): boolean {
    if (!user.lockUntil) return false;

    if (new Date() > new Date(user.lockUntil)) {
      // Auto unlock
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      return false;
    }

    return true;
  }

  registerFailedAttempt(user: AuthUser): AuthUser {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= this.config.maxFailedAttempts) {
      user.lockUntil = new Date(
        Date.now() + this.config.lockoutDurationMinutes * 60 * 1000,
      );
    }

    return user;
  }

  registerSuccessfulLogin(user: AuthUser): AuthUser {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    return user;
  }

  adminUnlock(user: AuthUser): AuthUser {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    return user;
  }
}

export default new LockoutSecurity();

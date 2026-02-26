import bcrypt from "bcryptjs";
import { AuthUser, SecurityConfig } from "./types";

const defaultConfig: Required<SecurityConfig> = {
  passwordExpiryDays: 90,
  passwordHistoryLimit: 3,
  maxFailedAttempts: 3,
  lockoutDurationMinutes: 30,
};

class PasswordSecurity {
  private config: Required<SecurityConfig>;

  constructor(config?: SecurityConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  setConfig(newConfig: SecurityConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // check for password expiration
  isPasswordExpired(user: AuthUser): boolean {
    if (!user.passwordChangedAt) return false;

    const expiryDate = new Date(user.passwordChangedAt);
    expiryDate.setDate(expiryDate.getDate() + this.config.passwordExpiryDays);

    return new Date() > expiryDate;
  }

  // check same password
  async isPasswordReused(
    newPassword: string,
    passwordHistory: string[] = [],
  ): Promise<boolean> {
    const recentPasswords = passwordHistory.slice(
      -this.config.passwordHistoryLimit,
    );

    for (const oldHash of recentPasswords) {
      const match = await bcrypt.compare(newPassword, oldHash);
      if (match) return true;
    }

    return false;
  }
}

export default new PasswordSecurity();

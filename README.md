# auth-security-lib

A lightweight Node.js/TypeScript library for **password security and account lockout management**.

It helps enforce:

- Password expiration policies
- Password history / reuse prevention
- Failed login attempt lockouts

---

## Installation

```bash
npm install auth-security-lib
```

or with Yarn:

```bash
yarn add auth-security-lib
```

# Features

Password Security

- Enforce password expiration (default: 90 days)

- Prevent reuse of last N passwords (default: 3)

- Stateless: library only checks/reports, consuming app handles DB updates

# Lockout Security

- Tracks failed login attempts

- Automatically locks account after configurable failures

- Supports automatic unlock after configurable duration

- Admin can manually unlock accounts

# Usage

# Importing

```
import { PasswordSecurity, LockoutSecurity, AuthUser } from "auth-security-lib";
```

# Sample User Data

```
const user: AuthUser = {
  password: "$2a$10$Gb/ueYzFSBTdHETGfqNcRez5Ao5bnL9QwXv94h.Gop.oLg6.gZ7a2",
  passwordChangedAt: new Date("2026-01-27T00:00:00.000Z"),
  passwordHistory: [
    "$2b$10$WkP9qEo6hR4uKfQzT2y7ve1LPbJ0rK6j4vXg8KRv2sS9Q8U2n6y8f",
    "$2b$10$hT7eL4pZr9G3eQwzK2y5ve1XsJ1LrD2j5vXf6KPv1rT7R9V1n4y7g"
  ],
  failedLoginAttempts: 0,
  lockUntil: null,
  email: "test@example.com", // additional fields are allowed
  role: "admin"
};
```

# Password Security Example

```
const newPassword = "admin123";

if (PasswordSecurity.isPasswordExpired(user)) {
  console.log("Password expired. User must reset password.");
}

const reused = await PasswordSecurity.isPasswordReused(newPassword, user.passwordHistory);

if (reused) {
  console.log("Cannot reuse previous passwords");
} else {
  console.log("Password is valid for use");
}
```

# Lockout Security Example

```
// Check if account is locked
if (LockoutSecurity.isAccountLocked(user)) {
  console.log("Account is currently locked");
}

// Register failed login attempt
LockoutSecurity.registerFailedAttempt(user);
console.log("Failed attempts:", user.failedLoginAttempts);

// Successful login
LockoutSecurity.registerSuccessfulLogin(user);

// Admin can unlock manually
LockoutSecurity.adminUnlock(user);
```

# Configuration

Default values:

```
{
  passwordExpiryDays: 90,
  passwordHistoryLimit: 3,
  maxFailedAttempts: 3,
  lockoutDurationMinutes: 30
}
```

# Override per instance:

```
import { SecurityConfig, LockoutSecurity, PasswordSecurity } from "auth-security-lib";

const config: SecurityConfig = {
  passwordExpiryDays: 60,
  passwordHistoryLimit: 5,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15
};

const passwordSec = new PasswordSecurity(config);
const lockoutSec = new LockoutSecurity(config);
```

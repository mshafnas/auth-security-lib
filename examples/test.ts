// src/test.ts
import bcrypt from "bcryptjs";
import { PasswordSecurity, LockoutSecurity, AuthUser } from "../src/index";

async function runTest() {
  // Sample user with extra fields
  const user: AuthUser = {
    password: await bcrypt.hash("admin", 10), // current password is "admin"
    passwordChangedAt: new Date("2026-01-27T00:00:00.000Z"),
    passwordHistory: [
      await bcrypt.hash("user", 10),
      await bcrypt.hash("shafnas", 10),
    ],
    failedLoginAttempts: 0,
    lockUntil: null,
    email: "test@example.com",
    role: "admin",
  };

  console.log("\n=== Password Security Tests ===");

  // 1. Check password expiration
  if (PasswordSecurity.isPasswordExpired(user)) {
    console.log("Password expired! User must reset.");
  } else {
    console.log("Password not expired.");
  }

  // 2. Check password reuse
  const reused = await PasswordSecurity.isPasswordReused(
    "user",
    user.passwordHistory,
  );
  console.log(`Is 'user' password reused? -> ${reused}`);

  const reusedNew = await PasswordSecurity.isPasswordReused(
    "newStrongPass1!",
    user.passwordHistory,
  );
  console.log(`Is 'newStrongPass1!' password reused? -> ${reusedNew}`);

  console.log("\n=== Lockout Security Tests ===");

  // Simulate login attempts
  const attempts = ["wrong1", "wrong2", "wrong3", "admin"];
  for (const attempt of attempts) {
    const match = await bcrypt.compare(attempt, user.password);

    if (!match) {
      const updateUser = LockoutSecurity.registerFailedAttempt(user);
      console.log(updateUser);
      console.log(
        `Login failed for "${attempt}". Attempts: ${user.failedLoginAttempts}`,
      );
      if (LockoutSecurity.isAccountLocked(user)) {
        console.log(`Account locked until ${user.lockUntil}`);
        break;
      }
    } else {
      LockoutSecurity.registerSuccessfulLogin(user);
      console.log(
        `Login successful for "${attempt}". Attempts reset: ${user.failedLoginAttempts}`,
      );
    }
  }

  console.log("\n=== Admin Unlock Test ===");
  LockoutSecurity.adminUnlock(user);
  console.log(
    `Admin unlocked account. Attempts: ${user.failedLoginAttempts}, lockUntil: ${user.lockUntil}`,
  );
}

runTest();

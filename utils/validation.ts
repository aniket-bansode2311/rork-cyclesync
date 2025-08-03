import { ValidationError } from "@/types/auth";

export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { field: "email", message: "Email is required" };
  }
  
  if (!emailRegex.test(email)) {
    return { field: "email", message: "Please enter a valid email address" };
  }
  
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }
  
  if (password.length < 8) {
    return { field: "password", message: "Password must be at least 8 characters" };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUppercase) {
    return { field: "password", message: "Password must contain at least one uppercase letter" };
  }
  
  if (!hasLowercase) {
    return { field: "password", message: "Password must contain at least one lowercase letter" };
  }
  
  if (!hasNumber) {
    return { field: "password", message: "Password must contain at least one number" };
  }
  
  if (!hasSpecial) {
    return { field: "password", message: "Password must contain at least one special character" };
  }
  
  return null;
};

export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character type checks
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
  
  // Normalize to 0-1 range
  return Math.min(strength / 6, 1);
};
import { AuthResponse, LoginCredentials, SignupCredentials } from "@/types/auth";
import { requestQueue } from "@/utils/requestQueue";

// Simulated API delay with jitter to prevent thundering herd
const apiDelay = (ms: number) => {
  const jitter = Math.random() * 200; // Add up to 200ms jitter
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
};

// Mock user database
const MOCK_USERS = [
  {
    id: "1",
    email: "test@example.com",
    password: "Test@123",
    name: "Test User"
  }
];

// Rate limiting for auth requests
let lastAuthRequest = 0;
const AUTH_REQUEST_INTERVAL = 1000; // 1 second between auth requests

const waitForAuthRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastAuthRequest;
  
  if (timeSinceLastRequest < AUTH_REQUEST_INTERVAL) {
    const waitTime = AUTH_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Auth rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastAuthRequest = Date.now();
};

// Mock API functions
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return requestQueue.add(async () => {
    await waitForAuthRateLimit();
    
    // Simulate network delay
    await apiDelay(1000);
    
    // Find user
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    
    if (!user || user.password !== credentials.password) {
      throw new Error("Invalid email or password");
    }
    
    // Generate mock JWT token
    const token = `mock-jwt-token-${Date.now()}`;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  });
};

export const signupApi = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  return requestQueue.add(async () => {
    await waitForAuthRateLimit();
    
    // Simulate network delay
    await apiDelay(1000);
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === credentials.email);
    
    if (existingUser) {
      throw new Error("Email already in use");
    }
    
    // Create new user
    const newUser = {
      id: `${MOCK_USERS.length + 1}`,
      email: credentials.email,
      password: credentials.password,
      name: credentials.name || ""
    };
    
    // In a real app, we would save to database
    MOCK_USERS.push(newUser);
    
    // Generate mock JWT token
    const token = `mock-jwt-token-${Date.now()}`;
    
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      token
    };
  });
};
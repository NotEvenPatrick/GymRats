export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
}
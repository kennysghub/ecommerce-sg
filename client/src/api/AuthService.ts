const API_URL = 'http://localhost:3000/v1';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const signUp = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to sign up');
  }

  return response.json();
};

export const signIn = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to sign in');
  }

  return response.json();
};

export const signOut = (): void => {
  const { setIsAuthenticated } = useAuth();
  console.log('Removing token from local storage and signing user out...');
  localStorage.removeItem('token');
  setIsAuthenticated(false);
};

export const RequireAuth = ({ children }: any) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return isAuthenticated === true ? children : navigate('/signin');
};

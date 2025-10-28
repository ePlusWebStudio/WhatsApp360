import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  return jest.fn(() => mockSocket);
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/WhatsApp360/i)).toBeInTheDocument();
  });

  test('shows login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/البريد الإلكتروني/i)).toBeInTheDocument();
  });
});

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByPlaceholderText(/البريد الإلكتروني/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/كلمة المرور/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /دخول/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockOnLogin = jest.fn();
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: 'test-token' }
    });

    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/البريد الإلكتروني/i), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/كلمة المرور/i), {
      target: { value: 'password' }
    });

    fireEvent.click(screen.getByRole('button', { name: /دخول/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test-token');
    });
  });

  test('handles login error', async () => {
    const mockOnLogin = jest.fn();
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/البريد الإلكتروني/i), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/كلمة المرور/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /دخول/i }));

    await waitFor(() => {
      expect(screen.getByText(/فشل في تسجيل الدخول/i)).toBeInTheDocument();
    });
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with loading state', () => {
    render(<Dashboard />);
    expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
  });

  test('renders dashboard with data', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/admin/dashboard/stats')) {
        return Promise.resolve({
          data: {
            users: { total_users: 100, active_users: 80 },
            messages: { messages_today: 50 },
            courses: { total_courses: 10 }
          }
        });
      }
      if (url.includes('/health')) {
        return Promise.resolve({
          data: { status: 'OK', timestamp: new Date().toISOString() }
        });
      }
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/لوحة التحكم الرئيسية/i)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // total users
    });
  });

  test('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/لوحة التحكم الرئيسية/i)).toBeInTheDocument();
    });
  });
});

// Integration tests
describe('App Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('redirects to login when no token', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/البريد الإلكتروني/i)).toBeInTheDocument();
  });

  test('shows dashboard when authenticated', () => {
    localStorage.setItem('token', 'test-token');

    render(<App />);

    // Should show dashboard after authentication check
    expect(screen.queryByPlaceholderText(/البريد الإلكتروني/i)).not.toBeInTheDocument();
  });
});

// API Service tests
describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('makes GET request successfully', async () => {
    const mockData = { id: 1, name: 'Test User' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    // Import the api service (this would be in a separate test file)
    const api = require('./services/api').default;

    const result = await api.get('/users/1');

    expect(result.data).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith('/users/1', expect.any(Object));
  });

  test('handles authentication errors', async () => {
    const errorResponse = {
      response: { status: 401 }
    };
    mockedAxios.get.mockRejectedValueOnce(errorResponse);

    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    const api = require('./services/api').default;

    try {
      await api.get('/protected');
    } catch (error) {
      // Should handle 401 error
    }

    expect(window.location.href).toBe('/login');
  });
});

// Utility tests
describe('Utility Functions', () => {
  test('date formatting', () => {
    const date = new Date('2025-10-28T10:00:00');
    const formatted = date.toLocaleDateString('ar-SA');
    expect(formatted).toBeTruthy();
  });

  test('phone number validation', () => {
    const validNumber = '966501234567';
    const invalidNumber = '123456789';

    expect(validNumber).toMatch(/^966\d{9}$/);
    expect(invalidNumber).not.toMatch(/^966\d{9}$/);
  });
});

import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Dashboard events
socket.on('stats-update', (data) => {
  console.log('Stats updated:', data);
  // You can dispatch to Redux store or trigger state updates here
});

// Message events
socket.on('new-message', (message) => {
  console.log('New message:', message);
  // Handle new message notifications
});

// User events
socket.on('user-activity', (activity) => {
  console.log('User activity:', activity);
  // Handle user activity updates
});

export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const subscribeToStats = (callback) => {
  socket.on('stats-update', callback);
  socket.emit('request-stats');
};

export const unsubscribeFromStats = (callback) => {
  socket.off('stats-update', callback);
};

export default socket;

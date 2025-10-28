const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

// Log levels
const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = levels[process.env.LOG_LEVEL?.toUpperCase() || 'INFO'];

// Format timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Format log message
function formatMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  let msg = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    msg += ` ${JSON.stringify(data)}`;
  }
  
  return msg;
}

// Write to file
function writeToFile(filePath, message) {
  try {
    fs.appendFileSync(filePath, message + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

// Log functions
const logger = {
  error: (message, data) => {
    if (levels.ERROR <= currentLevel) {
      const formatted = formatMessage('ERROR', message, data);
      console.error(formatted);
      writeToFile(errorLogFile, formatted);
      writeToFile(logFile, formatted);
    }
  },

  warn: (message, data) => {
    if (levels.WARN <= currentLevel) {
      const formatted = formatMessage('WARN', message, data);
      console.warn(formatted);
      writeToFile(logFile, formatted);
    }
  },

  info: (message, data) => {
    if (levels.INFO <= currentLevel) {
      const formatted = formatMessage('INFO', message, data);
      console.log(formatted);
      writeToFile(logFile, formatted);
    }
  },

  debug: (message, data) => {
    if (levels.DEBUG <= currentLevel) {
      const formatted = formatMessage('DEBUG', message, data);
      console.log(formatted);
      writeToFile(logFile, formatted);
    }
  }
};

module.exports = logger;

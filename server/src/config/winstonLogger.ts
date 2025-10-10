import winston from "winston";
import path from "path";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Tell winston to use these colors
winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

// Define which transports the winstonLogger must use, for log level separation
const transports = [
  // Console logging
  new winston.transports.Console(),

  // File logging - all logs
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/all.log"),
    level: "debug",
  }),

  // File logging - errors only
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/error.log"),
    level: "error",
  }),
];

// Create the winstonLogger
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format,
  transports,
});

export default winstonLogger;

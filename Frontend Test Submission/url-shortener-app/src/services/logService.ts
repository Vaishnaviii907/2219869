// src/services/logService.ts

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";
let ACCESS_TOKEN: string | null = null; // This will store the token received from the auth step

/**
 * Sets the access token to be used for subsequent log API calls.
 * Call this once your application starts or after successful authentication.
 * @param token The bearer access token.
 */
export const setAccessToken = (token: string) => {
    ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ1bml5YWx2YWlzaG5hdmk0MEBnbWFpbC5jb20iLCJleHAiOjE3NTI1NTk0NDksImlhdCI6MTc1MjU1ODU0OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjlhMGM0MDE2LWRhMGEtNGY4Mi1hZjg2LTY3NDhmMDQ4NTRlNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InZhaXNobmF2aSB1bml5YWwiLCJzdWIiOiJiNzM2ZjQ3MC0xYzkxLTQwNWMtOGYxNC1kZTY5NjBjZGEwODYifSwiZW1haWwiOiJ1bml5YWx2YWlzaG5hdmk0MEBnbWFpbC5jb20iLCJuYW1lIjoidmFpc2huYXZpIHVuaXlhbCIsInJvbGxObyI6IjIyMTk4NjkiLCJhY2Nlc3NDb2RlIjoiUUFoRFVyIiwiY2xpZW50SUQiOiJiNzM2ZjQ3MC0xYzkxLTQwNWMtOGYxNC1kZTY5NjBjZGEwODYiLCJjbGllbnRTZWNyZXQiOiJNQUhzS3d5QXNaZ1VxRkhHIn0.i1YL80SC9JAx2iPx3KPZTiP5eTCk4Dy-2WuOq1DM52M";
    console.log("Access token set for logging.");
};

/**
 * Interface for the structure of a log entry.
 * Stack is fixed to "frontend" for this application.
 */
interface LogEntry {
    stack: "frontend";
    level: "debug" | "info" | "warn" | "error" | "fatal";
    package: "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
    message: string;
}

/**
 * Sends a log entry to the evaluation server.
 * @param level The log level (e.g., "info", "error").
 * @param pkg The package/area where the log originated (e.g., "component", "api").
 * @param message The log message.
 */
export const Log = async (level: LogEntry['level'], pkg: LogEntry['package'], message: string) => {
    if (!ACCESS_TOKEN) {
        console.error("Log function called without an access token. Please ensure setAccessToken has been called.");
        return;
    }

    const logData: LogEntry = {
        stack: "frontend", // Always "frontend" for your application
        level: level.toLowerCase() as LogEntry['level'], // Ensure lowercase
        package: pkg.toLowerCase() as LogEntry['package'], // Ensure lowercase
        message: message,
    };

    try {
        const response = await fetch(LOG_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESS_TOKEN}`, // Use the dynamically set access token
            },
            body: JSON.stringify(logData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Log created successfully (LogID):", result.logID);
        } else {
            const errorData = await response.json();
            console.error(`Failed to send log (Status: ${response.status}):`, errorData);
            // Log this failure to console as it's an issue with the logging itself
        }
    } catch (error) {
        console.error("Network error or unhandled exception while sending log:", error);
        // Log this failure to console as it's an issue with the logging itself
    }
};

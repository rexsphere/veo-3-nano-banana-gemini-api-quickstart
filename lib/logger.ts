/**
 * Centralized logging utility for API requests and application events
 */

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  action: string;
  userId?: string;
  details?: Record<string, any>;
  duration?: number;
  statusCode?: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with color coding
    const emoji = {
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
      debug: "🐛",
    }[entry.level];

    const logMessage = `${emoji} [${entry.service}] ${entry.action}`;
    const logDetails = {
      timestamp: entry.timestamp,
      userId: entry.userId,
      duration: entry.duration ? `${entry.duration}ms` : undefined,
      statusCode: entry.statusCode,
      ...entry.details,
    };

    switch (entry.level) {
      case "error":
        console.error(logMessage, logDetails);
        break;
      case "warn":
        console.warn(logMessage, logDetails);
        break;
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(logMessage, logDetails);
        }
        break;
      default:
        console.log(logMessage, logDetails);
    }
  }

  info(service: string, action: string, details?: Record<string, any>): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: "info",
      service,
      action,
      details,
    });
  }

  warn(service: string, action: string, details?: Record<string, any>): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: "warn",
      service,
      action,
      details,
    });
  }

  error(service: string, action: string, error: any, details?: Record<string, any>): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: "error",
      service,
      action,
      details: {
        ...details,
        error: error?.message || String(error),
        stack: error?.stack,
      },
    });
  }

  debug(service: string, action: string, details?: Record<string, any>): void {
    this.addLog({
      timestamp: this.formatTimestamp(),
      level: "debug",
      service,
      action,
      details,
    });
  }

  // Log API request with timing
  apiRequest(
    service: string,
    endpoint: string,
    method: string,
    userId?: string,
    details?: Record<string, any>
  ): { end: (statusCode: number, error?: any) => void } {
    const startTime = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.info(service, `${method} ${endpoint}`, {
      requestId,
      userId,
      ...details,
    });

    return {
      end: (statusCode: number, error?: any) => {
        const duration = Date.now() - startTime;
        const logEntry: LogEntry = {
          timestamp: this.formatTimestamp(),
          level: statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info",
          service,
          action: `${method} ${endpoint} - ${statusCode}`,
          userId,
          duration,
          statusCode,
          details: {
            requestId,
            ...details,
            ...(error ? { error: error.message || String(error) } : {}),
          },
        };
        this.addLog(logEntry);
      },
    };
  }

  // Get logs (for debugging or admin panel)
  getLogs(filter?: {
    service?: string;
    level?: LogEntry["level"];
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter?.service) {
      filteredLogs = filteredLogs.filter((log) => log.service === filter.service);
    }

    if (filter?.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filter.level);
    }

    if (filter?.since) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) >= filter.since!
      );
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit);
    }

    return filteredLogs;
  }

  // Clear all logs
  clear(): void {
    this.logs = [];
    console.log("🧹 Logger: All logs cleared");
  }

  // Export logs as JSON (for download)
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Get statistics
  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byService: Record<string, number>;
    avgDuration: number;
    errors: number;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byService: {} as Record<string, number>,
      avgDuration: 0,
      errors: 0,
    };

    let totalDuration = 0;
    let durationCount = 0;

    this.logs.forEach((log) => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by service
      stats.byService[log.service] = (stats.byService[log.service] || 0) + 1;

      // Calculate avg duration
      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }

      // Count errors
      if (log.level === "error") {
        stats.errors++;
      }
    });

    stats.avgDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return stats;
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper for Next.js API routes
export function logApiRequest(
  req: Request,
  service: string,
  userId?: string,
  additionalDetails?: Record<string, any>
) {
  const url = new URL(req.url);
  const endpoint = url.pathname;
  const method = req.method;

  return logger.apiRequest(service, endpoint, method, userId, {
    query: Object.fromEntries(url.searchParams),
    ...additionalDetails,
  });
}


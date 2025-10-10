import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { authenticateRequest } from "@/lib/auth-middleware";

/**
 * GET /api/logs - Retrieve application logs
 * Query parameters:
 *  - service: Filter by service name
 *  - level: Filter by log level (info, warn, error, debug)
 *  - limit: Number of logs to return (default: 100)
 *  - format: "json" or "csv" (default: json)
 */
export async function GET(req: Request) {
  // Check authentication
  const authResult = await authenticateRequest(req);
  if (authResult.status === 401) {
    return authResult;
  }

  try {
    const url = new URL(req.url);
    const service = url.searchParams.get("service") || undefined;
    const level = url.searchParams.get("level") as any;
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const format = url.searchParams.get("format") || "json";

    const logs = logger.getLogs({
      service,
      level,
      limit,
    });

    if (format === "csv") {
      // Convert logs to CSV
      const csv = [
        "Timestamp,Level,Service,Action,Duration,Status,Details",
        ...logs.map((log) =>
          [
            log.timestamp,
            log.level,
            log.service,
            log.action,
            log.duration || "",
            log.statusCode || "",
            JSON.stringify(log.details || {}),
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="logs-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON format
    return NextResponse.json({
      logs,
      count: logs.length,
      stats: logger.getStats(),
    });
  } catch (error: any) {
    console.error("Error retrieving logs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve logs", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/logs - Clear all logs
 */
export async function DELETE(req: Request) {
  // Check authentication
  const authResult = await authenticateRequest(req);
  if (authResult.status === 401) {
    return authResult;
  }

  try {
    logger.clear();
    return NextResponse.json({ message: "Logs cleared successfully" });
  } catch (error: any) {
    console.error("Error clearing logs:", error);
    return NextResponse.json(
      { error: "Failed to clear logs", details: error.message },
      { status: 500 }
    );
  }
}


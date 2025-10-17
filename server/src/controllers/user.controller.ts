import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import logger from "../config/winstonLogger";

type SortableUserField = "name" | "id";

export const defaultPage = 1;
export const defaultSize = 10;

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  // Log incoming request
  logger.info("getUsers endpoint called", {
    requestId: req.id,
    query: req.query,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  try {
    // Set route query params
    const sortParam = req.query.sort as string | undefined;
    // Can turn this into a tuple to add new sort types
    const sort: SortableUserField | undefined = sortParam as SortableUserField | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : defaultPage;
    const size = req.query.size ? parseInt(req.query.size as string) : defaultSize;

    logger.debug("Parsed query parameters", { sort, page, size });

    // Call service to get users
    const result = userService.getUsers({ sort, page, size });

    // Build paging URLs
    const paging = userService.buildPagingUrls({
      page,
      size,
      sort,
      totalResults: result.totalResults,
      baseUrl: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
    });

    // Log successful response
    logger.info("getUsers completed successfully", {
      requestId: req.id,
      returnedCount: result.users.length,
      totalResults: result.totalResults,
      page,
      size,
    });

    // Send response - users and paging JSON objects
    res.json({ data: result.users, paging });
  } catch (error) {
    // Log error before passing to error handler
    logger.error("Error in getUsers controller", {
      requestId: req.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query,
    });
    next(error);
  }
};

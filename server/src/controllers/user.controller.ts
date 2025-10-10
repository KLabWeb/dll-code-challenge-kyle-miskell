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
    const sortParam = req.query.sort as string | undefined;
    const sort: SortableUserField | undefined = sortParam as SortableUserField | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : defaultPage;
    const size = req.query.size ? parseInt(req.query.size as string) : defaultSize;

    logger.debug("Parsed query parameters", { sort, page, size });

    const result = userService.getUsers({ sort, page, size });

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

import { Request, Response, NextFunction } from "express";
import validator from "validator";
import logger from "../config/winstonLogger";
import { ValidationError } from "./errorHandler";

const validSortFields = ["name", "id"];
const minSize = 1;
const maxSize = 100;
const integerPattern = /^\d+$/;
const defaultPage = 1;

export const paginationValidator = (req: Request, res: Response, next: NextFunction) => {
  let pageStr = req.query.page as string;
  let sizeStr = req.query.size as string;

  // Sanitize inputs to prevent injection attacks
  if (pageStr) {
    pageStr = validator.escape(validator.trim(pageStr));
  }
  if (sizeStr) {
    sizeStr = validator.escape(validator.trim(sizeStr));
  }

  logger.debug("Validating pagination parameters", {
    page: pageStr,
    size: sizeStr,
  });

  // Validate page parameter
  if (pageStr !== undefined) {
    const page = parseInt(pageStr);

    if (!integerPattern.test(pageStr) || isNaN(page) || page < defaultPage) {
      logger.warn("Invalid page parameter rejected", {
        page: pageStr,
        ip: req.ip,
        path: req.path,
      });
      return next(new ValidationError("Invalid page parameter"));
    }
  }

  // Validate size parameter
  if (sizeStr !== undefined) {
    const size = parseInt(sizeStr);

    if (!integerPattern.test(sizeStr) || isNaN(size) || size < minSize || size > maxSize) {
      logger.warn("Invalid size parameter rejected", {
        size: sizeStr,
        maxSize: maxSize,
        ip: req.ip,
        path: req.path,
      });
      return next(new ValidationError(`Invalid size parameter. Must be between 1 and ${maxSize}`));
    }
  }

  logger.debug("Pagination validation passed");
  next();
};

export const validateSort = (req: Request, res: Response, next: NextFunction) => {
  let sort = req.query.sort as string;

  // Sanitize sort input to prevent injection attacks
  if (sort) {
    sort = validator.escape(validator.trim(sort));
    logger.debug("Validating sort parameter", { sort });
  }

  if (sort !== undefined && (!sort || !validSortFields.includes(sort))) {
    logger.warn("Invalid sort field rejected", {
      sort,
      validFields: validSortFields,
      ip: req.ip,
      path: req.path,
    });
    return next(
      new ValidationError(`Invalid sort field. Valid fields: ${validSortFields.join(", ")}`)
    );
  }

  if (sort) {
    logger.debug("Sort validation passed", { sort });
  }
  next();
};

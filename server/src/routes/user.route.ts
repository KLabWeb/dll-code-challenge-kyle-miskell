import express from "express";
import * as userController from "../controllers/user.controller";
import { paginationValidator, validateSort } from "../middleware/paginationValidator";
import { rateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get paginated list of users
 *     description: Retrieves a paginated and optionally sorted list of users. Supports pagination through page and size parameters, and sorting by user fields.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/SizeParam'
 *       - $ref: '#/components/parameters/SortParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved users list
 *         headers:
 *           X-Request-ID:
 *             description: Unique request identifier for tracing
 *             schema:
 *               type: string
 *               format: uuid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *             examples:
 *               defaultPagination:
 *                 summary: Default pagination (first page, 10 items)
 *                 value:
 *                   data:
 *                     - id: 0
 *                       name: "Jorn"
 *                     - id: 1
 *                       name: "Mike"
 *                   paging:
 *                     totalResults: 50
 *                     next: "http://localhost:3001/api/users?page=2&size=10"
 *               sortedByName:
 *                 summary: Sorted by name alphabetically
 *                 value:
 *                   data:
 *                     - id: 2
 *                       name: "Andrew"
 *                     - id: 0
 *                       name: "Jorn"
 *                   paging:
 *                     totalResults: 50
 *                     next: "http://localhost:3001/api/users?page=2&size=10&sort=name"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Add rateLimiter, PaginationValidator, and validateSort middleware to getUsers route
router.get("/", rateLimiter, paginationValidator, validateSort, userController.getUsers);

export default router;

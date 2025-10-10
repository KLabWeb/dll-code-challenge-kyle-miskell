import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
      description: "A robust REST API for user management with pagination and sorting capabilities",
      contact: {
        name: "Kyle T Miskell",
        email: "kmiskell@protonmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001/api/v1",
        description: "Development server (v1)",
      },
      {
        url: "http://localhost:3001/api",
        description: "Development server (legacy - unversioned)",
      },
    ],
    tags: [
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: {
              type: "integer",
              description: "Unique user identifier",
              example: 1,
            },
            name: {
              type: "string",
              description: "User's full name",
              example: "John Doe",
            },
          },
        },
        PagingResponse: {
          type: "object",
          required: ["totalResults"],
          properties: {
            totalResults: {
              type: "integer",
              description: "Total number of users available",
              example: 50,
            },
            previous: {
              type: "string",
              description: "URL to fetch the previous page (omitted on first page)",
              example: "http://localhost:3001/api/users?page=1&size=10",
            },
            next: {
              type: "string",
              description: "URL to fetch the next page (omitted on last page)",
              example: "http://localhost:3001/api/users?page=3&size=10",
            },
          },
        },
        UsersListResponse: {
          type: "object",
          required: ["data", "paging"],
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/User",
              },
            },
            paging: {
              $ref: "#/components/schemas/PagingResponse",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["status", "code", "message", "timestamp"],
          properties: {
            status: {
              type: "string",
              enum: ["error"],
              description: "Error status indicator",
            },
            code: {
              type: "string",
              description: "Machine-readable error code",
              example: "VALIDATION_ERROR",
            },
            message: {
              type: "string",
              description: "Human-readable error message",
              example: "Invalid page parameter",
            },
            requestId: {
              type: "string",
              format: "uuid",
              description: "Unique request identifier for tracing",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "ISO 8601 timestamp of when the error occurred",
            },
          },
        },
        HealthResponse: {
          type: "object",
          required: [
            "status",
            "service",
            "version",
            "timestamp",
            "uptime",
            "environment",
            "node",
            "memory",
          ],
          properties: {
            status: {
              type: "string",
              enum: ["healthy"],
              description: "Health status of the service",
            },
            service: {
              type: "string",
              description: "Service name",
              example: "user-management-api",
            },
            version: {
              type: "string",
              description: "API version",
              example: "1.0.0",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Current server timestamp",
            },
            uptime: {
              type: "object",
              properties: {
                seconds: {
                  type: "integer",
                  description: "Uptime in seconds",
                },
                formatted: {
                  type: "string",
                  description: "Human-readable uptime",
                  example: "2h 34m 12s",
                },
              },
            },
            environment: {
              type: "string",
              description: "Current environment",
              example: "development",
            },
            node: {
              type: "object",
              properties: {
                version: {
                  type: "string",
                  description: "Node.js version",
                },
                platform: {
                  type: "string",
                  description: "Operating system platform",
                },
                arch: {
                  type: "string",
                  description: "CPU architecture",
                },
              },
            },
            memory: {
              type: "object",
              properties: {
                rss: {
                  type: "string",
                  description: "Resident Set Size",
                  example: "45MB",
                },
                heapTotal: {
                  type: "string",
                  description: "Total heap size",
                  example: "20MB",
                },
                heapUsed: {
                  type: "string",
                  description: "Used heap size",
                  example: "15MB",
                },
                external: {
                  type: "string",
                  description: "External memory usage",
                  example: "2MB",
                },
              },
            },
          },
        },
      },
      parameters: {
        PageParam: {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          description: "Page number to retrieve",
        },
        SizeParam: {
          in: "query",
          name: "size",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
          description: "Number of items per page (max: 100)",
        },
        SortParam: {
          in: "query",
          name: "sort",
          schema: {
            type: "string",
            enum: ["name", "id"],
          },
          description: "Field to sort by",
        },
      },
      responses: {
        ValidationError: {
          description: "Validation error - Invalid request parameters",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                code: "VALIDATION_ERROR",
                message: "Invalid page parameter",
                requestId: "550e8400-e29b-41d4-a716-446655440000",
                timestamp: "2025-01-15T10:30:00.000Z",
              },
            },
          },
        },
        TooManyRequests: {
          description: "Too many requests - Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                code: "TOO_MANY_REQUESTS",
                message: "Too many requests from this IP, please try again later.",
                requestId: "550e8400-e29b-41d4-a716-446655440000",
                timestamp: "2025-01-15T10:30:00.000Z",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
                requestId: "550e8400-e29b-41d4-a716-446655440000",
                timestamp: "2025-01-15T10:30:00.000Z",
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to API routes for JSDoc annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

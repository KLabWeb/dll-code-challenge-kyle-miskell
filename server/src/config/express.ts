import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";

dotenv.config();

// Create Express app instance
const app = express();

app.set("port", process.env.APP_PORT || 3001);
app.set("host", process.env.APP_HOST || "localhost");

// CORS using environment variable
// Expects front-end to be running on localhost:3000
// adds CORS headers, allowing cross-origin front-end requests
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Adds security headers to prevent XSS attacks, MIME sniffing, etc.
app.use(helmet());

// HTTP request logger - tiny sets to minimal output
// Ex. log GET /tiny 200 2 - 0.188 ms
app.use(morgan("tiny"));


app.use(bodyParser.json());

// Build Swagger API Documentation at /api-docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "User Management API Documentation",
  })
);

export default app;

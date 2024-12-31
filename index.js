import express from "express"
import connectDB from "../config/db.js"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import xss from "xss-clean"
import mongoose from "mongoose"

import errorHandlerMiddleware from "../middleware/errorHandler.js"
import notFoundMiddleware from "../middleware/notFound.js"

import libraryRouter from "../route/library.js"
import noteRouter from "../route/note.js"
import authRouter from "../route/auth.js"
import authenticateUser from "../middleware/authentication.js"

dotenv.config()

const app = express()

// Middleware setup
app.use(cors())
app.use(helmet())
app.use(xss())
app.use(cookieParser())
app.use(express.json())

// Routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/profile", authenticateUser, authRouter)
app.use("/api/v1/library", authenticateUser, libraryRouter)
app.use("/api/v1/library", authenticateUser, noteRouter)

// Error handling
app.use(errorHandlerMiddleware)
app.use(notFoundMiddleware)

// Database connection
const dbURI =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.MONGO_URI
    : process.env.MONGO_URI_TEST

connectDB(dbURI)

export default function handler(req, res) {
  app(req, res) // Express app will handle the request and response
}

import express from "express"
import connectDB from "./config/db.js"
import "express-async-errors"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"

import errorHandlerMiddleware from "./middleware/errorHandler.js"
import notFoundMiddleware from "./middleware/notFound.js"

// routes
import libraryRouter from "./route/library.js"
import noteRouter from "./route/note.js"
import authRouter from "./route/auth.js"
import authenticateUser from "./middleware/authentication.js"
import mongoose from "mongoose"

const corsOptions = {
  origin: `${process.env.FRONTEND_URL}`, // Frontend's URL
  credentials: true,
}

const app = express()

// app.use(cors())
app.use(cors(corsOptions))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/profile", authenticateUser, authRouter)
app.use("/api/v1/library", authenticateUser, libraryRouter)
app.use("/api/v1/library", authenticateUser, noteRouter)

app.use(errorHandlerMiddleware)
app.use(notFoundMiddleware)

const port = process.env.PORT || 3000

const dbURI =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.MONGO_URI
    : process.env.MONGO_URI_TEST

let server

const start = async () => {
  try {
    await connectDB(dbURI)
    server = app.listen(port, () => {
      // console.log(`Server is listening on port ${port}`)
    })
  } catch (error) {
    // console.error("Server error:", error.message)
    process.exit(1) // Exit the process with an error code
  }
}

start()

// Gracefully stop the server when tests are done
const stop = async () => {
  try {
    await mongoose.connection.close() // Close DB connection
    server.close() // Stop the server
  } catch (error) {
    // console.error("Error during shutdown:", error.message)
  }
}

// Export app for testing and server stop
// export default app
// export { stop }

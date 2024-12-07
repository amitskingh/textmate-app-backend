const express = require("express")
const app = express()
const connectDB = require("./config/db.js")
require("express-async-errors")
require("dotenv").config()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const xss = require("xss-clean")

const errorHandlerMiddleware = require("./middleware/errorHandler.js")
const notFoundMiddleware = require("./middleware/notFound.js")

const corsOptions = {
  origin: `${process.env.FRONTEND_URL}`, // Frontend's URL
  credentials: true,
}

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://textmate-frontend.netlify.app",
// ]

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.includes(origin) || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//   credentials: true,
// }

app.use(cors(corsOptions))
app.use(helmet())
app.use(xss())
app.use(cookieParser())
app.use(express.json())

// routes
const libraryRouter = require("./route/book.js")
const noteRouter = require("./route/note.js")
const authRouter = require("./route/auth.js")
const authenticateUser = require("./middleware/authentication.js")
const AppError = require("./utils/AppError.js")

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/profile", authenticateUser, authRouter)
app.use("/api/v1/books", authenticateUser, libraryRouter)
app.use("/api/v1/books", authenticateUser, noteRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`)
    })
  } catch (error) {
    console.error("Server error:", error.message)
    process.exit(1) // Exit the process with an error code
  }
}

start()

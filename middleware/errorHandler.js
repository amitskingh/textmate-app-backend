import AppError from "../utils/AppError.js"

const errorHandler = (err, req, res, next) => {
  // // If the error is an instance of AppError, use its properties
  // if (err instanceof AppError) {
  //   return res.status(err.statusCode || 500).json({
  //     status: "error",
  //     message: err.message,
  //   })
  // }

  // // If the error is not an instance of AppError, handle it as a generic server error
  // return res.status(500).json({
  //   status: "error",
  //   message: "Something went wrong!",
  // })
  let message = err.message || "Something went wrong"
  let statusCode = err.statusCode || 400

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400

    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ")
  }

  // Handle duplicate key errors (e.g., username or email already exists)
  if (err.code === 11000) {
    // 11000 is the MongoDB code for duplicate key errors
    message = `Duplicate field value entered for ${
      Object.keys(err.keyValue)[0]
    }. Please choose another value.`
    statusCode = 400
  }

  console.log(message, statusCode)

  res.status(statusCode).json({
    statusCode: statusCode,
    status: "error",
    message: message,
  })
}

export default errorHandler

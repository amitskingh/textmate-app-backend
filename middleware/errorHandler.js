import AppError from "../utils/AppError"

const errorHandler = (err, req, res, next) => {
  // If the error is an instance of AppError, use its properties
  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      status: "error",
      message: err.message,
    })
  }

  // If the error is not an instance of AppError, handle it as a generic server error
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  })
}

export default errorHandler

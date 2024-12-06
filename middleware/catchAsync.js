// Purpose:
// Catch any error and pass it to the next middleware (error handler)
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

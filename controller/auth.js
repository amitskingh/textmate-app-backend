import AppError from "../utils/AppError"
import catchAsync from "../middleware/catchAsync"
import User from "../model/User"

// *********************************************************************************************************

const setCookie = (res, token) => {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  res.cookie("token", token, {
    expires: expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

// *********************************************************************************************************

const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body

  // Validate input
  if (!name || !email || !password) {
    return next(new AppError("Name, email, and password are required", 400))
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError("Email already registered", 400))
  }

  // Create the user
  const user = await User.create({ name, email, password })

  // Generate JWT and set cookie
  const token = user.createJWT()
  setCookie(res, token)

  // Respond with success
  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    user: { name: user.name },
  })
})

// *********************************************************************************************************

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400))
  }

  // Find user by email
  const user = await User.findOne({ email })
  if (!user) {
    return next(new AppError("Invalid email or password", 401)) // Generic error
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401)) // Generic error
  }

  // Generate token and set cookie
  const token = user.createJWT()
  setCookie(res, token)

  // Respond with user details
  res.status(200).json({
    status: "success",
    message: "Login successful",
    user: { name: user.name },
  })
})

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  })
}

const profile = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("User not authenticated", 401))
  }

  res.status(200).json({
    status: "success",
    message: "Profile retrieved successfully",
    data: {
      name: req.user.name,
      email: req.user.email,
    },
  })
}

export { register, login, logout, profile }

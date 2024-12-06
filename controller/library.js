const Library = require("../model/Library")
const Note = require("../model/Note")
const catchAsync = require("../middleware/catchAsync")
const AppError = require("../utils/AppError")
const mongoose = require("mongoose")

// retuning the library that comes under the userId
const getAllLibrary = catchAsync(async (req, res, next) => {
  const { userId } = req.user

  const libraries = await Library.find({ createdBy: userId })

  if (!libraries || libraries.length === 0) {
    return next(new AppError("No libraries found for this user", 404))
  }

  res.status(200).json({
    message: "Libraries retrieved successfully",
    data: libraries,
  })
})

// creating library under the hood of current active user
const createLibrary = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { libraryName } = req.body

  const library = await Library.create({
    libraryName: libraryName,
    createdBy: userId,
  })

  // Validate the input
  if (
    !libraryName ||
    libraryName.trim().length < 1 ||
    libraryName.trim().length > 50
  ) {
    return next(
      new AppError(
        "Library name is required and must be at least 1 and at most 50 characters long",
        400
      )
    )
  }

  res.status(201).json({
    status: "success",
    message: "Library created successfully",
    data: library,
  })
})

// Following need to be considered
// 1. Atomicity --> why if the book is deleted but not notes then we need to roollback
// 2. Validation of libraryId
const deleteLibrary = catchAsync(async (req, res, next) => {
  const { libraryId } = req.params
  const { userId } = req.user

  // Validate libraryId
  if (!mongoose.Types.ObjectId.isValid(libraryId)) {
    return next(new AppError("Invalid library ID", 400))
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete the library
    const library = await Library.findOneAndDelete({
      _id: libraryId,
      createdBy: userId,
    }).session(session)

    if (!library) {
      throw new AppError("Library does not exist", 400)
    }

    // Delete associated notes
    await Note.deleteMany({ libraryId: libraryId }).session(session)

    // commit transaction
    await session.commitTransaction()

    session.endSession()

    // Send response
    res.status(200).json({
      success: true,
      message: "Library and associated notes deleted successfully",
      data: library,
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    next(error)
  }
})

module.exports = { getAllLibrary, createLibrary, deleteLibrary }

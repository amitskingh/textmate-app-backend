const Library = require("../model/Library")
const Note = require("../model/Note")
const catchAsync = require("../middleware/catchAsync")
const AppError = require("../utils/AppError")
const mongoose = require("mongoose")
const slugify = require("slugify")

// ********************************************************************************************************

// Return the libraries that belong to the current user
const getAllLibrary = catchAsync(async (req, res, next) => {
  const { userId } = req.user

  const libraries = await Library.find({ createdBy: userId })

  if (!libraries || libraries.length === 0) {
    return next(new AppError("No libraries found for this user", 404))
  }

  res.status(200).json({
    status: "success",
    message: "Libraries retrieved successfully",
    data: libraries,
  })
})

// ********************************************************************************************************

// Creating a library under the hood of the current active user
const createLibrary = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { libraryName } = req.body

  // Validate libraryName before creating it
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

  // Check if library already exists for the user
  const existingLibrary = await Library.findOne({
    libraryName: libraryName,
    createdBy: userId,
  })

  if (existingLibrary) {
    return next(new AppError("Library name must be unique for each user", 400))
  }

  // Create the library
  const library = await Library.create({
    libraryName: libraryName,
    createdBy: userId,
  })

  res.status(201).json({
    status: "success",
    message: "Library created successfully",
    data: library,
  })
})

// ********************************************************************************************************

// Delete library along with its associated notes in a transaction
const deleteLibrary = catchAsync(async (req, res, next) => {
  const { librarySlug } = req.params
  const { userId } = req.user

  // Validate the librarySlug and find the library
  const library = await Library.findOne({ librarySlug, createdBy: userId })
  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // Start a transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete the library by librarySlug and user
    const libraryToDelete = await Library.findOneAndDelete({
      slug: librarySlug,
      createdBy: userId,
    }).session(session)

    if (!libraryToDelete) {
      throw new AppError("Library does not exist", 400)
    }

    // Delete all notes associated with this library
    await Note.deleteMany({ libraryId: libraryToDelete._id }).session(session)

    // Commit the transaction
    await session.commitTransaction()
    session.endSession()

    // Send the response
    res.status(200).json({
      status: "success",
      message: "Library and associated notes deleted successfully",
      data: libraryToDelete,
    })
  } catch (error) {
    // Rollback if anything goes wrong
    await session.abortTransaction()
    session.endSession()
    next(error)
  }
})

// ********************************************************************************************************

const renameLibrary = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { librarySlug } = req.params
  const { libraryName } = req.body

  // Validate if libraryName is provided
  if (
    !libraryName ||
    libraryName.trim().length < 1 ||
    libraryName.trim().length > 50
  ) {
    return next(
      new AppError(
        "Library name is required and must be between 1 and 50 characters",
        400
      )
    )
  }

  // Find the library to ensure it exists and belongs to the current user
  const library = await Library.findOne({
    slug: librarySlug,
    createdBy: userId,
  })

  if (!library) {
    return next(new AppError("Library does not exist for the user", 404))
  }

  // Generate a new slug for the updated name
  const newSlug = slugify(this.libraryName, { lower: true, strict: true })

  // Check if a library with the same name or slug already exists for the user
  const existingLibrary = await Library.findOne({
    slug: newSlug,
    createdBy: userId,
  })

  if (existingLibrary) {
    return next(new AppError("A library with this name already exists", 400))
  }

  // Update the library name and slug
  library.libraryName = libraryName // slug will be saved using the preSave present in schema

  await library.save()

  // Send response with the updated library
  res.status(200).json({
    status: "success",
    message: "Library renamed successfully",
    data: library,
  })
})

module.exports = { getAllLibrary, createLibrary, deleteLibrary, renameLibrary }

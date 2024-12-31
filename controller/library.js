import mongoose from "mongoose"
import slugify from "slugify"
import catchAsync from "../middleware/catchAsync.js"
import Library from "../model/Library.js"
import Note from "../model/Note.js"
import AppError from "../utils/AppError.js"

const getSlug = (libraryName) => {
  const slug = slugify(libraryName, { lower: true, strict: true })
  return slug
}

// ********************************************************************************************************

// Return the libraries that belong to the current user
const getAllLibrary = catchAsync(async (req, res, next) => {
  const { userId } = req.user

  let page = 1 // Default page
  const limit = 10 // Fixed limit
  let sortList = [] // Default sort by libraryName asc

  // Update page from query if provided
  if (req.query.page) {
    const parsedPage = Number(req.query.page)
    page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1 // Ensure positive integer
  }

  // Update sort field from query if provided

  if (req.query.nameOrder) {
    // console.log(req.query.nameOrder.toLowerCase())

    if (req.query.nameOrder.toLowerCase() === "descending") {
      sortList.push("-libraryName")
    } else {
      sortList.push("libraryName")
    }
  }

  if (req.query.dateType) {
    if (req.query.dateType.toLowerCase() === "old") {
      sortList.push("createdAt")
    } else {
      sortList.push("-updatedAt")
    }
  }

  if (sortList.length === 0) {
    sortList.push("libraryName")
  }

  let sort = sortList.map((query) => query).join(" ")

  // console.log(sort)

  // Fetch total item count
  const totalItems = await Library.countDocuments({ createdBy: userId })

  const totalPages = Math.ceil(totalItems / limit)

  // Handle excessive page numbers
  if (page > totalPages && totalPages > 0) {
    page = totalPages // Default to the last page if requested page exceeds total pages
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit

  // Fetch data from the database with fixed limit and dynamic sort
  const libraries = await Library.find({ createdBy: userId })
    .sort(sort)
    .skip(skip)
    .limit(limit)

  // if (!libraries || libraries.length === 0) {
  //   return next(new AppError("No libraries found for this user", 404))
  // }

  // Response with libraries and pagination metadata
  res.status(200).json({
    success: true,
    data: libraries,
    meta: {
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
      },
    },
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
  const librarySlug = getSlug(libraryName)
  const library = await Library.create({
    libraryName: libraryName,
    librarySlug: librarySlug,
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
  const library = await Library.findOne({
    librarySlug: librarySlug,
    createdBy: userId,
  })

  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // Start a transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete the library by librarySlug and user
    const libraryToDelete = await Library.findOneAndDelete({
      librarySlug: librarySlug,
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
    librarySlug: librarySlug,
    createdBy: userId,
  })

  if (!library) {
    return next(new AppError("Library does not exist for the user", 404))
  }

  // Generate a new librarySlug for the updated name
  const newSlug = slugify(libraryName, { lower: true, strict: true })

  // Check if a library with the same name or librarySlug already exists for the user
  const existingLibrary = await Library.findOne({
    librarySlug: newSlug,
    createdBy: userId,
  })

  if (existingLibrary && !existingLibrary._id.equals(library._id)) {
    return next(new AppError("A library with this name already exists", 400))
  }

  // Update the library name and slug
  library.libraryName = libraryName
  library.librarySlug = newSlug

  await library.save()

  // Send response with the updated library
  res.status(200).json({
    status: "success",
    message: "Library renamed successfully",
    data: library,
  })
})

export { createLibrary, deleteLibrary, getAllLibrary, renameLibrary }

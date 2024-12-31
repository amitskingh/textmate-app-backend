import Note from "../model/Note.js"
import Library from "../model/Library.js"
import catchAsync from "../middleware/catchAsync.js"
import AppError from "../utils/AppError.js"
import slugify from "slugify"
import mongoose from "mongoose"

const getSlug = (noteName) => {
  const slug = slugify(noteName, { lower: true, strict: true })
  return slug
}

// ********************************************************************************************************

const getAllNotes = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { librarySlug } = req.params

  // Find the library by slug and userId
  const library = await Library.findOne({
    librarySlug: librarySlug,
    createdBy: userId,
  })

  // If library doesn't exist, return an error
  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // --------------------------------------------------------

  let page = 1 // Default page
  const limit = 10 // Fixed limit
  let sortList = [] // Default sort by libraryName asc

  // Update page from query if provided
  if (req.query.page) {
    const parsedPage = Number(req.query.page)
    page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1 // Ensure positive integer
    // console.log("Page: ", page)
  }

  // Update sort field from query if provided

  if (req.query.nameOrder) {
    // console.log(req.query.nameOrder.toLowerCase())

    if (req.query.nameOrder.toLowerCase() === "descending") {
      sortList.push("-noteName")
    } else {
      sortList.push("noteName")
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
    sortList.push("noteName")
  }

  let sort = sortList.map((query) => query).join(" ")

  // console.log(sort)

  // Fetch total item count
  const totalItems = await Note.countDocuments({
    createdBy: userId,
    libraryId: library._id,
  })

  const totalPages = Math.ceil(totalItems / limit)

  // Handle excessive page numbers
  if (page > totalPages && totalPages > 0) {
    page = totalPages // Default to the last page if requested page exceeds total pages
  }

  // console.log(page)

  // Calculate skip value for pagination
  const skip = (page - 1) * limit

  // Find notes related to the library and user
  const notes = await Note.find({ libraryId: library._id, createdBy: userId })
    .sort(sort)
    .skip(skip)
    .limit(limit)

  // console.log(limit, totalItems)

  // --------------------------------------------------------

  res.status(200).json({
    success: true,
    data: notes,
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

const getNote = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { librarySlug, noteSlug } = req.params

  // Find the library by librarySlug and userId
  const library = await Library.findOne({
    librarySlug: librarySlug,
    createdBy: userId,
  })

  // If the library does not exist, return an error
  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // Find the note by slug and related to the specific library and user
  const note = await Note.findOne({
    noteSlug: noteSlug,
    libraryId: library._id,
    createdBy: userId,
  })

  // If the note doesn't exist, return an error
  if (!note) {
    return next(new AppError("Note does not exist for this user", 404))
  }

  // Send response with the note data
  res.status(200).json({
    status: "success",
    message: "Note retrieved successfully",
    data: note,
  })
})

// ********************************************************************************************************

// Creating a note under a specific library by the current user
const createNote = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { noteName } = req.body
  const { librarySlug } = req.params

  // console.log(userId, noteName, librarySlug)

  // validate library slug
  const library = await Library.findOne({
    librarySlug: librarySlug,
    createdBy: userId,
  })

  // console.log(library)

  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // Ensure note name uniqueness within the library for the user
  const existingNote = await Note.findOne({
    noteName,
    createdBy: userId,
    libraryId: library._id,
  })

  if (existingNote) {
    return next(
      new AppError("Note name must be unique within the library", 400)
    )
  }

  const noteSlug = getSlug(noteName)
  const note = await Note.create({
    noteName,
    noteSlug,
    libraryId: library._id,
    librarySlug: library.librarySlug,
    createdBy: userId,
  })

  await Library.findOneAndUpdate(
    { librarySlug: librarySlug },
    { $inc: { fileCount: 1 } },
    { new: true } // Return the updated document after increment
  )

  // console.log("Note: ", note)

  res.status(201).json({
    status: "success",
    message: "Note created successfully",
    data: note,
  })
})

// ********************************************************************************************************

const updateNote = catchAsync(async (req, res, next) => {
  const { userId } = req.user // Ensure you're getting the userId
  const { librarySlug, noteSlug } = req.params
  const { content } = req.body

  // Find the library to ensure it exists and belongs to the current user
  const library = await Library.findOne({
    librarySlug: librarySlug,
    createdBy: userId,
  })

  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // console.log(library)

  // Find and update the note in the specified library
  const note = await Note.findOneAndUpdate(
    {
      noteSlug: noteSlug, // Matching by slug (assuming slug is unique per user and library)
      libraryId: library._id,
      createdBy: userId,
    },
    {
      content,
    },
    {
      new: true, // Return the updated note
      runValidators: true, // Ensure validation on the updated data
    }
  )

  if (!note) {
    return next(new AppError("Note does not exist or not authorized", 404))
  }

  // Send response with the updated note
  res.status(200).json({
    status: "success",
    message: "Note updated successfully",
    data: note,
  })
})

// ********************************************************************************************************

const deleteNote = catchAsync(async (req, res, next) => {
  const { userId } = req.user
  const { librarySlug, noteSlug } = req.params

  // Validate library slug
  const library = await Library.findOne({
    librarySlug: librarySlug,
    createdBy: userId,
  })

  if (!library) {
    return next(new AppError("Library does not exist for this user", 404))
  }

  // Validate note by noteSlug and ensure it belongs to the correct user and library
  const note = await Note.findOne({
    noteSlug: noteSlug,
    libraryId: library._id,
    createdBy: userId,
  })

  if (!note) {
    return next(
      new AppError("Note does not exist in this library for the user", 404)
    )
  }

  // Start a transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete the note by slug, user and library reference
    const noteToDelete = await Note.findOneAndDelete({
      noteSlug: noteSlug,
      createdBy: userId,
      libraryId: library._id,
    }).session(session)

    if (!noteToDelete) {
      throw new AppError("Note deletion failed", 400)
    }

    // Decrement fileCount in the library after deletion
    await Library.findByIdAndUpdate(
      library._id, // Use library._id for more reliable query
      { $inc: { fileCount: -1 } },
      { new: true } // Return the updated document after increment
    ).session(session)

    // Commit transaction
    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      status: "success",
      message: "Note deleted successfully",
      data: noteToDelete,
    })
  } catch (error) {
    // Rollback if anything fails
    await session.abortTransaction()
    session.endSession()
    next(error)
  }
})

// ********************************************************************************************************

const renameNote = catchAsync(async (req, res, next) => {
  const { userId } = req.user // Ensure you're getting the userId from the authenticated user
  const { librarySlug, noteSlug } = req.params // Extract librarySlug and noteSlug from the params
  const { noteName } = req.body // Extract new note name from request body

  // Validate if noteName is provided
  if (!noteName || noteName.trim().length < 1 || noteName.trim().length > 50) {
    return next(
      new AppError(
        "Note name is required and must be between 1 and 50 characters",
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
    return next(new AppError("Library does not exist for this user", 404))
  }

  const note = await Note.findOne({
    noteSlug: noteSlug,
    libraryId: library._id,
    createdBy: userId,
  })

  const newNoteSlug = getSlug(noteName)
  // Find the note to ensure it exists in the correct library and is created by the current user
  const existingNote = await Note.findOne({
    noteSlug: newNoteSlug,
    libraryId: library._id,
    createdBy: userId,
  })

  if (existingNote && !existingNote._id.equals(note._id)) {
    return next(new AppError("Note with same name already exists!", 400))
  }

  // Update the note's name
  const updatedNote = await Note.findOneAndUpdate(
    { _id: note._id },
    { noteName }, // Rename the note
    {
      new: true, // Return the updated note
      runValidators: true, // Ensure validation on the updated data
    }
  )

  // Send response with the updated note
  res.status(200).json({
    status: "success",
    message: "Note renamed successfully",
    data: updatedNote,
  })
})

export { getAllNotes, createNote, deleteNote, getNote, updateNote, renameNote }

const express = require("express")
const router = express.Router()
const validateLibrary = require("../middleware/validate-Library.js")

const {
  getAllNotes,
  createNote,
  deleteNote,
  getNote,
  updateNote,
} = require("../controller/note")

router
  .route("/:LibraryId/notes")
  .get(validateLibrary, getAllNotes)
  .post(validateLibrary, createNote)
router
  .route("/:LibraryId/notes/:noteId")
  .get(validateLibrary, getNote)
  .delete(validateLibrary, deleteNote)
  .patch(validateLibrary, updateNote)

module.exports = router

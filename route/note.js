const express = require("express")
const router = express.Router()

const {
  getAllNotes,
  createNote,
  deleteNote,
  getNote,
  updateNote,
} = require("../controller/note")

router.route("/:LibraryId/notes").get(getAllNotes).post(createNote)
router
  .route("/:LibraryId/notes/:noteId")
  .get(getNote)
  .delete(deleteNote)
  .patch(updateNote)

module.exports = router

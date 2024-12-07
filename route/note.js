const express = require("express")
const router = express.Router()

const {
  getAllNotes,
  createNote,
  deleteNote,
  getNote,
  updateNote,
} = require("../controller/note")

router.route("/:librarySlug/notes").get(getAllNotes).post(createNote)
router
  .route("/:librarySlug/notes/:noteSlug")
  .get(getNote)
  .delete(deleteNote)
  .patch(updateNote)

module.exports = router

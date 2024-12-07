const express = require("express")
const router = express.Router()

const {
  getAllNotes,
  createNote,
  deleteNote,
  getNote,
  updateNote,
  renameNote,
} = require("../controller/note")

router.route("/:librarySlug/notes").get(getAllNotes).post(createNote)
router
  .route("/:librarySlug/notes/:noteSlug")
  .get(getNote)
  .delete(deleteNote)
  .patch(updateNote)
router.route("/:librarySlug/notes/:noteSlug/rename").put(renameNote)

module.exports = router

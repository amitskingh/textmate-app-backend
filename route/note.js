import express from "express"
const router = express.Router()

import {
  getAllNotes,
  createNote,
  deleteNote,
  getNote,
  updateNote,
  renameNote,
} from "../controller/note"

router.route("/:librarySlug/notes").get(getAllNotes).post(createNote)
router
  .route("/:librarySlug/notes/:noteSlug")
  .get(getNote)
  .delete(deleteNote)
  .patch(updateNote)
router.route("/:librarySlug/notes/:noteSlug/rename").put(renameNote)

export default router

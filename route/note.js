import express from "express"
const router = express.Router()

import {
  getAllNotes,
  createNote,
  deleteNote,
  getNote,
  updateNote,
  renameNote,
} from "../controller/note.js"

router.route("/:librarySlug/note").get(getAllNotes).post(createNote)
router
  .route("/:librarySlug/note/:noteSlug")
  .get(getNote)
  .delete(deleteNote)
  .patch(updateNote)
router.route("/:librarySlug/note/:noteSlug/rename").put(renameNote)

export default router

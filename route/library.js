import express from "express"
const router = express.Router()

import {
  getAllLibrary,
  createLibrary,
  deleteLibrary,
  renameLibrary,
} from "../controller/Library"

router.route("/").get(getAllLibrary).post(createLibrary)
router.route("/:librarySlug").delete(deleteLibrary)
router.route("/:librarySlug/rename").put(renameLibrary)

export default router

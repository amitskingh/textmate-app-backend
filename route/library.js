const express = require("express")
const router = express.Router()

const {
  getAllLibrary,
  createLibrary,
  deleteLibrary,
  renameLibrary,
} = require("../controller/Library")

router.route("/").get(getAllLibrary).post(createLibrary)
router.route("/:librarySlug").delete(deleteLibrary)
router.route("/:librarySlug/rename").put(renameLibrary)

module.exports = router

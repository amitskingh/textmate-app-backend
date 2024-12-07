const express = require("express")
const router = express.Router()

const {
  getAllLibrary,
  createLibrary,
  deleteLibrary,
} = require("../controller/Library")

router.route("/").get(getAllLibrary).post(createLibrary)
router.route("/:librarySlug").delete(deleteLibrary)

module.exports = router

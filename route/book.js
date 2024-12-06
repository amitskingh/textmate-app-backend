const express = require("express")
const router = express.Router()

const { getAllLibrary, createLibrary, deleteLibrary } = require("../controller/Library")

router.route("/").get(getAllLibrary).post(createLibrary)
router.route("/:LibraryId").delete(deleteLibrary)

module.exports = router

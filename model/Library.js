const mongoose = require("mongoose")

const LibrarySchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      trim: true,
      required: [true, "Please provide library name"],
      minlength: 1,
      maxlength: 50,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User", // Reference to User who owns the library
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
)

// Ensure library names are unique for each user
LibrarySchema.index({ libraryName: 1, createdBy: 1 }, { unique: true })

module.exports = mongoose.model("Library", LibrarySchema)

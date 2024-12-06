const mongoose = require("mongoose")

const NoteSchema = new mongoose.Schema(
  {
    noteName: {
      type: String,
      required: [true, "Please provide the note name"],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    content: {
      type: String,
    },
    libraryId: {
      type: mongoose.Types.ObjectId,
      ref: "Library", // Reference to the Library this note belongs to
      required: [true, "Please provide library"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User", // Reference to the User who created the note
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
)

// Ensure note names are unique for each user
NoteSchema.index({ noteName: 1, createdBy: 1 }, { unique: true })

// Allow searching notes by name within a specific library
NoteSchema.index({ libraryId: 1, noteName: 1 })

module.exports = mongoose.model("Note", NoteSchema)

import mongoose from "mongoose"
import slugify from "slugify"

const NoteSchema = new mongoose.Schema(
  {
    noteName: {
      type: String,
      required: [true, "Please provide note name"],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    noteSlug: {
      type: String,
      required: true, // Slug is required for routing
    },
    content: {
      type: String,
      default: "[]",
    },
    libraryId: {
      type: mongoose.Types.ObjectId,
      ref: "Library",
      required: true, // Notes are tied to a library
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true, // Notes are tied to a user
    },
  },
  { timestamps: true }
)

// Compound index to ensure noteName is unique per user within a library
NoteSchema.index({ noteName: 1, libraryId: 1, createdBy: 1 }, { unique: true })

// Add an index for noteSlug to optimize lookups
NoteSchema.index({ noteSlug: 1, libraryId: 1 }, { unique: true })

export default mongoose.model("Note", NoteSchema)

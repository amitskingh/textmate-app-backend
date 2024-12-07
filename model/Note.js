const mongoose = require("mongoose")
const slugify = require("slugify")

const NoteSchema = new mongoose.Schema(
  {
    noteName: {
      type: String,
      required: [true, "Please provide note name"],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true, // Slug is required for routing
    },
    content: {
      type: String,
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

// Add an index for slug to optimize lookups
NoteSchema.index({ slug: 1, libraryId: 1 }, { unique: true })

// Middleware to generate slug before saving
NoteSchema.pre("save", function (next) {
  if (this.isModified("noteName")) {
    // If noteName is modified, generate a new slug
    this.slug = slugify(this.noteName, { lower: true, strict: true })
  }
  next()
})

module.exports = mongoose.model("Note", NoteSchema)

import mongoose from "mongoose"
import slugify from "slugify"

const LibrarySchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      required: [true, "Please provide library name"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true, // Slug is required for routing
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true, // Ensures the library is tied to a user
    },
  },
  { timestamps: true }
)

// Compound index to ensure libraryName is unique per user
LibrarySchema.index({ libraryName: 1, createdBy: 1 }, { unique: true })

// Add an index for slug to optimize lookups
LibrarySchema.index({ slug: 1, createdBy: 1 }, { unique: true })

// Middleware to generate slug before saving
LibrarySchema.pre("save", function (next) {
  if (this.isModified("libraryName")) {
    // If libraryName is modified, generate a new slug
    this.slug = slugify(this.libraryName, { lower: true, strict: true })
  }
  next()
})

export default mongoose.model("Library", LibrarySchema)

import mongoose from "mongoose"

const LibrarySchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      required: [true, "Please provide library name"],
      trim: true,
      minlength: 1,
      maxlength: 50,
      match: [
        /^[a-zA-Z0-9\s]+$/,
        "Library name can only contain alphabets, numbers, and spaces",
      ],
    },
    librarySlug: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true, // Ensures the library is tied to a user
    },
    fileType: {
      type: "String",
      default: "library",
      immutable: true, // Makes the creation date unchangeable
    },
    fileCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// Compound index to ensure libraryName is unique per user
LibrarySchema.index({ libraryName: 1, createdBy: 1 }, { unique: true })

// Add an index for librarySlug to optimize lookups
LibrarySchema.index({ librarySlug: 1, createdBy: 1 }, { unique: true })

export default mongoose.model("Library", LibrarySchema)

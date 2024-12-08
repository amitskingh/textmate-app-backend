import connectDB from "./config/db.js"
import dotenv from "dotenv"
dotenv.config()

import User from "./model/User.js"
import Note from "./model/Note.js"
import Library from "./model/Library.js"

// const schema = User
// const schema = Note
const schema = Library

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    await schema.deleteMany()
    console.log("Successfull!")
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

start()

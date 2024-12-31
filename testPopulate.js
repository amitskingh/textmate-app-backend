import mongoose from "mongoose"
import User from "./model/User.js"
import Library from "./model/Library.js"
import Note from "./model/Note.js"

import dotenv from "dotenv"
dotenv.config()

// Mock Data
const UserData = {
  name: "Naruto",
  email: "naruto@gmail.com",
  password: "naruto",
}

// Mock Library Names
const libraryNames = [
  { libraryName: "Modern JavaScript", librarySlug: "modern-javascript" },
  { libraryName: "FullStack Bootcamp", librarySlug: "fullstack-bootcamp" },
  { libraryName: "Nodejs Essentials", librarySlug: "nodejs-essentials" },
  { libraryName: "React Mastery", librarySlug: "react-mastery" },
  { libraryName: "Tailwind Tricks", librarySlug: "tailwind-tricks" },
  { libraryName: "Algorithms and DSA", librarySlug: "algorithms-and-dsa" },
  {
    libraryName: "System Design Simplified",
    librarySlug: "system-design-simplified",
  },
  { libraryName: "MongoDB Magic", librarySlug: "mongodb-magic" },
  { libraryName: "Redis Insights", librarySlug: "redis-insights" },
  { libraryName: "MySQL and Beyond", librarySlug: "mysql-and-beyond" },
  {
    libraryName: "Web Development Basics",
    librarySlug: "web-development-basics",
  },
  { libraryName: "Frontend Frameworks", librarySlug: "frontend-frameworks" },
  { libraryName: "Backend Architecture", librarySlug: "backend-architecture" },
  { libraryName: "API Development", librarySlug: "api-development" },
  {
    libraryName: "Debugging Demystified",
    librarySlug: "debugging-demystified",
  },
  { libraryName: "Design Patterns", librarySlug: "design-patterns" },
  { libraryName: "Coding Challenges", librarySlug: "coding-challenges" },
  { libraryName: "Testing Strategies", librarySlug: "testing-strategies" },
  {
    libraryName: "Clean Code Principles",
    librarySlug: "clean-code-principles",
  },
  {
    libraryName: "Data Structures in Depth",
    librarySlug: "data-structures-in-depth",
  },
  { libraryName: "Deployment Guides", librarySlug: "deployment-guides" },
  {
    libraryName: "Microservices Explained",
    librarySlug: "microservices-explained",
  },
  {
    libraryName: "Authentication and Authorization",
    librarySlug: "authentication-and-authorization",
  },
  {
    libraryName: "Docker and Kubernetes Basics",
    librarySlug: "docker-and-kubernetes-basics",
  },
]

let USERID
const register = async () => {
  try {
    const user = new User(UserData)

    await user.save()
    USERID = user._id
    console.log("User registered successfully")
  } catch (error) {
    console.log("User registration failed", error.message)
  }
}

const populateLibrary = async () => {
  try {
    const libraries = libraryNames.map(({ libraryName, librarySlug }) => ({
      libraryName,
      librarySlug,
      createdBy: USERID,
    }))

    const res = await Library.insertMany(libraries)

    console.log("Libraries populated successfully")
  } catch (error) {
    console.log("Libraries population failed", error)
  }
}

const cleanup = async () => {
  try {
    await mongoose.connection.db.dropDatabase()
    console.log("All mock data cleaned successfully")
  } catch (error) {
    console.log("All mock data cleaned failed", error.message)
  }
}

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST)
    console.log("Successfull Connected!")
    await cleanup()
    await register()
    await populateLibrary()
    mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.log("Failed to connect!", error.message)
  }
}

start()

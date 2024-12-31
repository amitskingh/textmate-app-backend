import mongoose from "mongoose"
import app from "../index.js" // Make sure app is exported correctly
import request from "supertest"
import { expect, use } from "chai"
import User from "../model/User.js"
import { stop } from "../index.js"

describe("AUTH API TEST", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST)
  })

  after(async () => {
    await mongoose.connection.db.dropDatabase()
    await stop()
  })

  describe("POST /api/v1/auth/register", () => {
    it("should not register existing user", async () => {
      const user = {
        name: "nagato",
        email: "nagato@gmail.com",
        password: "nagato",
      }

      const res = await request(app).post("/api/v1/auth/register").send(user)

      // Assertions
      expect(res.status).to.equal(400) // User should be created successfully
      expect(res.body)
        .to.have.property("message")
        .to.equal("Email already registered")
    })
  })
})

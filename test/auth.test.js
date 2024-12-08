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
    it("should register a new user", async () => {
      const user = {
        name: "Test User",
        email: "testuser@example.com",
        password: "testpassword",
      }

      const res = await request(app).post("/api/v1/auth/register").send(user)

      // Assertions
      expect(res.status).to.equal(201) // User should be created successfully
      expect(res.body).to.have.property("user")
      expect(res.body).to.have.property("user").to.have.property("name")
    })

    it("should not register user with null email", async () => {
      const user = {
        name: "Test User",
        password: "testpassword",
      }

      const res = await request(app).post("/api/v1/auth/register").send(user)

      expect(res.status).to.equal(400)
    })

    it("should not register with any missing field", async () => {
      const user = {
        email: "testuser@example.com",
        password: "testpassword",
      }

      const res = await request(app).post("/api/v1/auth/register").send(user)

      // Assertions
      expect(res.status).to.equal(400)
    })
  })

  describe("POST /api/v1/auth/login", () => {
    it("should allow login to existing user with matching email and password", async () => {
      const user = {
        email: "testuser@example.com",
        password: "testpassword",
      }

      const res = await request(app).post("/api/v1/auth/login").send(user)

      // Assertions
      expect(res.status).to.equal(200)
      expect(res.body).to.have.property("user")
      expect(res.body).to.have.property("user").to.have.property("name")
    })

    it("should not allow login to existing user with mismatching email and password", async () => {
      const user = {
        email: "test@example.com",
        password: "testpassword",
      }

      const res = await request(app).post("/api/v1/auth/login").send(user)

      // Assertions
      expect(res.status).to.equal(401)
    })

    it("should not allow login to non existing user", async () => {
      const user = {
        email: "random@gmail.com",
        password: "testpassword",
      }

      const res = await request(app).post("/api/v1/auth/login").send(user)

      expect(res.status).to.equal(401)
    })

    it("should not allow login with null field", async () => {
      const user = {}

      const res = await request(app).post("/api/v1/auth/login").send(user)

      // Assertions
      expect(res.status).to.equal(400)
    })
  })
})

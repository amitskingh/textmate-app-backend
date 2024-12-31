import mongoose from "mongoose"
import app from "../index.js" // Make sure app is exported correctly
import request from "supertest"
import { expect, use } from "chai"
import User from "../model/User.js"
import { stop } from "../index.js"

let USER1 = { token: null, librarySlug: null }
let USER2 = { token: null, librarySlug: null }
describe("LIBRARY API TEST", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST)

    const user1 = {
      name: "Test User",
      email: "testuser1@example.com",
      password: "testpassword",
    }

    const user2 = {
      name: "Test User",
      email: "testuser2@example.com",
      password: "testpassword",
    }

    const res1 = await request(app).post("/api/v1/auth/register").send(user1)
    USER1.token = res1.body.token

    const res2 = await request(app).post("/api/v1/auth/register").send(user2)
    USER2.token = res2.body.token
  })

  after(async () => {
    await mongoose.connection.db.dropDatabase()
    await stop()
  })

  describe("POST /api/v1/library", () => {
    it("should create a new library for USER1", async () => {
      const library = {
        libraryName: "lab is great",
      }

      const res = await request(app)
        .post("/api/v1/library")
        .set("Authorization", `Bearer ${USER1.token}`)
        .send(library)

      // Assertions
      expect(res.status).to.equal(201) // Library should be created successfully
      expect(res.body).to.have.property("data").to.have.property("librarySlug")
      expect(res.body).to.have.property("data").to.have.property("libraryName")

      USER1.librarySlug = res.body.data.librarySlug
    })

    it("should create a new library for USER2", async () => {
      const library = {
        libraryName: "lab is awesome",
      }

      const res = await request(app)
        .post("/api/v1/library")
        .set("Authorization", `Bearer ${USER2.token}`)
        .send(library)

      // Assertions
      expect(res.status).to.equal(201) // Library should be created successfully
      expect(res.body).to.have.property("data").to.have.property("librarySlug")
      expect(res.body).to.have.property("data").to.have.property("libraryName")

      USER2.librarySlug = res.body.data.librarySlug
    })

    it("should be able create a new library with same libraryName as of USER1 for USER2", async () => {
      const library = {
        libraryName: "lab is great",
      }

      const res = await request(app)
        .post("/api/v1/library")
        .set("Authorization", `Bearer ${USER2.token}`)
        .send(library)

      // Assertions
      expect(res.status).to.equal(201) // Library should be created successfully
      expect(res.body).to.have.property("data").to.have.property("librarySlug")
      expect(res.body).to.have.property("data").to.have.property("libraryName")
    })

    it("should not create existing library for same user", async () => {
      const library = {
        libraryName: "lab is great",
      }

      const res = await request(app)
        .post("/api/v1/library")
        .set("Authorization", `Bearer ${USER1.token}`)
        .send(library)

      // Assertions
      expect(res.status).to.equal(400) // Library should not be created
    })

    it("should not create library having name other than numbers and alphabets", async () => {
      const library = {
        libraryName: "$-@-$",
      }

      const res = await request(app)
        .post("/api/v1/library")
        .set("Authorization", `Bearer ${USER1.token}`)
        .send(library)

      // Assertions
      expect(res.status).to.equal(400) // Library should not be created
    })

    it("should not create library with null value", async () => {
      const library = {
        libraryName: null,
      }

      const res = await request(app)
        .post("/api/v1/library")
        .set("Authorization", `Bearer ${USER1.token}`)
        .send(library)

      // Assertions
      expect(res.status).to.equal(400) // Library should not be created
    })
  })

  describe("GET /api/v1/library", () => {
    it("should give all the library", async () => {
      const res = await request(app)
        .get("/api/v1/library")
        .set("Authorization", `Bearer ${USER1.token}`)

      // Assertions
      expect(res.status).to.equal(200) // Library should be created successfully
      expect(res.body).to.have.property("data")
      expect(res.body).to.have.property("data").instanceOf(Array)
    })

    it("should give any library without token", async () => {
      const res = await request(app).get("/api/v1/library")

      // Assertions
      expect(res.status).to.equal(401) // Library should be created successfully
    })
  })

  describe("DELETE /api/v1/library/:librarySlug", () => {
    it("should delete a library of USER1", async () => {
      const res = await request(app)
        .delete(`/api/v1/library/${USER1.librarySlug}`)
        .set("Authorization", `Bearer ${USER1.token}`)

      // Assertions
      expect(res.status).to.equal(200) // Library should be created successfully
      expect(res.body).to.have.property("data")
      expect(res.body)
        .to.have.property("data")
        .to.have.property("librarySlug")
        .to.equal(USER1.librarySlug)
    })

    it("should not delete a non existing library of USER1", async () => {
      const res = await request(app)
        .delete(`/api/v1/library/${USER1.librarySlug}`)
        .set("Authorization", `Bearer ${USER1.token}`)

      // Assertions
      expect(res.status).to.equal(404) // Library should be created successfully
    })

    it("should not delete library of USER2 by USER1", async () => {
      const res = await request(app)
        .delete(`/api/v1/library/${USER2.librarySlug}`)
        .set("Authorization", `Bearer ${USER1.token}`)

      // Assertions
      expect(res.status).to.equal(404) // Library should be created successfully
    })
  })
})

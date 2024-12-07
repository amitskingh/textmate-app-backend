const chai = require("chai")
const chaiHttp = require("chai-http")
const app = require("../app") // path to Express app
const { expect } = chai

chai.use(chaiHttp)

describe("Auth API Tests", () => {
  it("should register a new user", async () => {
    const res = await chai.request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    })
    expect(res.status).to.equal(201)
    expect(res.body).to.have.property("token")
    expect(res.body.user).to.have.property("name", "Test User")
  })
})

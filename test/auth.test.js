import { expect } from 'chai';  // Import only what you need (expect in this case)
import chai from 'chai';         // Import chai itself for HTTP request support
import chaiHttp from 'chai-http'; // Import chai-http for making requests
import { register, login } from '../controller/auth.js'; 
import app from '../app.js';  // Ensure correct path and file extension

chai.use(chaiHttp);

describe("Auth API Tests", () => {
  it("should register a new user", async () => {
    const res = await chai.request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("token");
    expect(res.body.user).to.have.property("name", "Test User");
  });
});

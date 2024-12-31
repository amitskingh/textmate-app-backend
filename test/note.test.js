import mongoose from "mongoose";
import app from "../index.js";
import request from "supertest"
import { expect } from "chai";
import { stop } from "../index.js";

describe("NOTE API TEST", ()=>{
    before(async()=>{
        await mongoose.connect(process.env.MONGO_URI_TEST)
    })

    after(async()=>{
        await mongoose.connection.db.dropDatabase()
        await stop()
    })


    
    
})
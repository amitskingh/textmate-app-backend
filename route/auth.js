import express from "express"
const router = express.Router()

import { register, login, logout, profile } from "../controller/auth.js"

router.post("/register", register)
router.post("/login", login)
router.get("/logout", logout)
router.get("/", profile)

export default router

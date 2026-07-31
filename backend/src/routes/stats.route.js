import { Router } from "express"
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js"
import { getAllStats } from "../controller/stats.controller.js"

const router = Router()

router.get("/", protectRoute, requireAdmin, getAllStats )

export default router
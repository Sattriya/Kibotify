import { clerkClient } from "@clerk/express";

export const protectRoute = (req, res, next) => {
    if (!req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized - Please login first" })
    }

    next()
}

export const requireAdmin = async (req, res, next) => {
    try {
        const currentUser = await clerkClient.users.getUser(req.auth.userId)
        const isAdmin = currentUser.primaryEmailAddress.emailAddress === process.env.ADMIN_EMAIL

        if (!isAdmin) {
            return res.status(401).json({ message: "Unauthorized - you must be an admin" })
        }

        next()
    } catch (error) {
        console.error("Error checking admin status:", error)
        next(error)
    }

}
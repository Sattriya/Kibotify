import { clerkClient, getAuth } from "@clerk/express";

// middleware untuk memastikan user sudah login sebelum mengakses route
export const protectRoute = (req, res, next) => {
    // mengambil data autentikasi user dari Clerk
    const auth = getAuth(req);

    // jika tidak ada userId, berarti user belum login
    if (!auth.userId) {
        return res.status(401).json({
            message: "Unauthorized - Please login first"
        })
    }

    // melanjutkan request ke middleware atau controller berikutnya
    next()
}

// middleware untuk memastikan user yang mengakses route adalah admin
export const requireAdmin = async (req, res, next) => {
    // mengambil data autentikasi user dari Clerk
    const auth = getAuth(req);

    try {
        // mengambil data user dari Clerk berdasarkan userId
        const currentUser = await clerkClient.users.getUser(auth.userId)

        // mengecek apakah email user merupakan email admin berdasarkan data yang ada di .env
        const isAdmin =
            currentUser.primaryEmailAddress?.emailAddress === process.env.ADMIN_EMAIL

        // jika user bukan admin, request ditolak
        if (!isAdmin) {
            return res.status(401).json({
                message: "Unauthorized - you must be an admin"
            })
        }

        // jika user adalah admin, lanjut ke middleware atau controller berikutnya
        next()
    } catch (error) {
        console.error("Error checking admin status:", error)
        next(error)
    }
}
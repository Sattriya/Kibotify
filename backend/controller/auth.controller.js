import { User } from "../models/user.model.js"

export const authCallback = async (req, res, next) => {
    try {
        const { id, firstname, lastName, imageUrl } = req.body

        const user = await User.findOne({ clerkId: id })

        if (!user) {
            await User.create({
                clerkId: id,
                fullName: `${firstname} ${lastName}`,
                imageUrl
            })
        }

        res.status(200).json({ success: true })
    } catch (error) {
        console.log("error in authcallback", error)
        next(error)
    }
}
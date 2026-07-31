import { User } from "../models/user.model.js"

export const authCallback = async (req, res, next) => {
    try {
        const { id, firstName, lastName, imageUrl } = req.body

        const user = await User.findOneAndUpdate(
            { clerkId: id },
            {
                clerkId: id,
                fullName: [firstName, lastName].filter(Boolean).join(" "),
                imageUrl,
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        if (!user) {
            await User.create({
                clerkId: id,
                fullName: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
                imageUrl
            })
        }

        res.status(200).json({ success: true })
    } catch (error) {
        console.log("Error in authcallback", error)
        next(error)
    }
}
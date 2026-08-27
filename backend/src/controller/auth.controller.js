import { User } from "../models/user.model.js"

// function untuk menyimpan atau memperbarui data user dari Clerk ke database MongoDB
export const authCallback = async (req, res, next) => {
    try {
        const { id, firstName, lastName, imageUrl } = req.body

        const user = await User.findOneAndUpdate(
            // mencari user berdasarkan clerkId
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

        // jika user belum terdaftar / dia sedang register, maka buatkan data baru
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
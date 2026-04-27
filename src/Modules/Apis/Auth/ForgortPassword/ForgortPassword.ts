import { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";


const ForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {

        // get email from request body and validate it
        const { email } = z
            .object({
                email: z.string().email(),
            })
            .parse(req.body);

        // fetch user from database
        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(403).json({
                message: "user is invalid check email and try again "
            })
        }

        await UserModel.updateOne(
            { _id: user?._id },
            { $set: { password: "" } },
        );

        

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}
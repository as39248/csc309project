import { PrismaClient } from "@prisma/client";
import { comparePassword, generateToken, generateRefreshToken } from "../../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST'){
        try{
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({message: "Please provide all the required fields"});
            }

            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });
            
            
            if (!user || !(await comparePassword(password, user.password))) {
                return res.status(401).json({
                message: "Invalid credentials",
                });
            }
            const token = generateToken({ userId: user.id, email: user.email, role: user.role});
            if (!token) {
                return res.status(500).json({ message: "Couldn't generate token for user creation." });
            }

            const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role});
            if (!refreshToken) {
                return res.status(500).json({ message: "Couldn't generate refresh token for user creation." });
            }

            return res.status(200).json({"access token": token, "refresh token": refreshToken});
        }catch(error){
            res.status(500).json({message: "Failed login.", error: error});
        }       
    }
    else{
        return res.status(405).json({ message: "Method not allowed" });
    }
    
}  
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../../../utils/auth";

const prisma = new PrismaClient();
const avatars = ["/avatars/avatar1.png", "/avatars/avatar2.png", "/avatars/avatar3.png"];       

export default async function handler(req, res) {
    if (req.method === "POST") { 
        try{   
            const { firstName, lastName, password, phoneNumber, email, avatar, role } = req.body;
            
            if (!firstName || !lastName || !phoneNumber || !email || !password || !role || !avatar) {
                return res.status(400).json({
                message: "Please provide all the required fields",
                });
            }
            
				     
            
            if (!avatars.includes(avatar)){
            	return res.status(400).json({
                message: "Avatar not included."
                });
            }
				
                 
            const emailExists = await prisma.user.findUnique({
                where : {email}
            })
            
            

            if (emailExists){
                return res.status(400).json({
                    message: "Email already used.",
                });
            }

            const user = await prisma.user.create({
                data: {
                firstName,
                lastName,
                password: await hashPassword(password),
                phoneNumber,
                email,
                avatar,
                role,
                },
                select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true,
                avatar: true,
                role: true,
                },
            });
            res.status(201).json(user);
        } catch(error){
            return res.status(500).json({message: "Failed to create user"});
        }
    }
    else{
        res.status(405).json({ message: "Method not allowed" });
    }
}
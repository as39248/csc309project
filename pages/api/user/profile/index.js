import { PrismaClient } from "@prisma/client";

import { verifyToken } from "../../../../utils/auth";

const prisma = new PrismaClient();
const avatars = ["/avatars/avatar1.png", "/avatars/avatar2.png", "/avatars/avatar3.png"];   

export default async function handler(req, res) {
    if (req.method === 'PATCH'){
        try{
            const user = verifyToken(req.headers.authorization);
            
            if  (!user){
                return res.status(401).json({message: "Unauthorized"});
            }
            
            
            const { firstName, lastName, phoneNumber, email, avatar} = req.body;

            if (!firstName && !lastName && !phoneNumber && !email && !avatar) {
                return res.status(400).json({message: "Please provide at least 1 required fields"});
            }
            
            // Don't allow visitors to edit their profile
            if (user.role === 'VISITOR'){
                return res.status(401).json({message: "User is not permitted to make this request."});
            }
				
            let data = {};           
            if (email) {
            	const emailExists = await prisma.user.findUnique({
                where: {
                    email,
                },
            	});
            	if (emailExists) {
					return res.status(400).json({message: "The given email is already used."});            	
            	}
               data.email = email;
            }
				
            
            if (firstName){
                data.firstName = firstName;
            }
            if (lastName) {
                data.lastName = lastName;
            }
            if (phoneNumber) {
                data.phoneNumber = phoneNumber;
            }
            if (email) {
                data.email = email;
            }
            if (avatar) {
            	if (!avatars.includes(avatar)){
                    return res.status(400).json({
                    message: "Avatar not included."
                    });
                }
                data.avatar = avatar;
            }
            const updatedUser = await prisma.user.update({
                where: {id: Number(user.userId)},
                data: data,
            })
            return res.status(201).json(updatedUser);
            
        }catch(error){
            return res.status(500).json({message: "Failed to update profile.", error: error});
        }       
    }
    else{
        return res.status(405).json({ message: "Method not allowed" });
    }
    
}  
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === "POST") {
        try{
            // Verify if user is authenticated
            const user = verifyToken(req.headers.authorization);
            if  (!user){
                return res.status(401).json({message: "Unauthorized",});
            }
            const {title, explanation, tags, code, isForked} = req.body;

            if (!title || !code){
                return res.status(400).json({message: "Missing required fields for creating templates."});
            }
            
            // Create a new template
            const newTemplate = await prisma.template.create({
                data: {
                    title: title, 
                    explanation: explanation,
                    tags: tags,
                    userId: Number(user.userId),
                    code: code,
                    isForked: isForked,
                },
            });
            return res.status(201).json(newTemplate);
        }catch(error){
            res.status(500).json({message: "Failed to create a new template.", error:error});
        }
    }
    else if (req.method === 'GET'){

        const {title, explanation, tag, code, userId} = req.query;
        
        try {
            // search through all templates

            let whereClause = {
                AND: [],
            };
          
            if (title) {
            whereClause.AND.push({ title: { contains: title, } });
            }
        
            if (explanation) {
            whereClause.AND.push({ explanation: { contains: explanation,  } });
            }
        
            if (tag) {
            whereClause.AND.push({ tags: { contains: tag,  } });
            }

            if (code) {
            whereClause.AND.push({ code: { contains: code,  } });
            }

            if (userId) {
            whereClause.AND.push({ userId: {equals: Number(userId)}});
            }

            const templates = await prisma.template.findMany({
                // take: Number(take) || 10,
                // skip: Number(skip) || 0,
                where: whereClause.AND.length > 0 ? whereClause : undefined,
            });

            return res.status(200).json(templates);
        } catch (error) {
            res.status(500).json({message: "Failed to search templates.", error: error});
        }
    } 
    else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
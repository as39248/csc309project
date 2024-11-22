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
            
            // Sort tags based on whether they already exist or not
           const connectTags = tags.map((tag)=> {
                    		return {
                    			where: {name: tag},
                    			create: {name: tag}
                    		};
                    	} );
            // Create a new template
            const newTemplate = await prisma.template.create({
                data: {
                    title: title, 
                    explanation: explanation,
                    tags: {
                    	connectOrCreate: connectTags,
                    },
                    userId: Number(user.userId),
                    code: code,
                    isForked: isForked,
                },
                include: {tags:true},
            });
            return res.status(201).json(newTemplate);
        }catch(error){
            res.status(500).json({message: "Failed to create a new template.", error:error});
        }
    }
    else if (req.method === 'GET'){
        const user = verifyToken(req.headers.authorization);

        if  (!user){
            return res.status(401).json({message: "Unauthorized"});
        }
        
        const {title, explanation, tags, code, all} = req.query;

        let userId = user.userId;
        if(user.role === 'VISITOR' || all === "true"){
        		userId = null;
        }

        try {
            // search through all templates
            const templates = await prisma.template.findMany({
                where:{
                    title: title ? {contains: title} : undefined,
                    explanation: explanation ? {contains: explanation} : undefined,
                    userId: userId ? {equals: Number(userId)} : undefined,
                    tags: tags ? {hasSome: tags} : undefined,
                    code: code ? {contains: code,} : undefined,
            }});
            return res.status(200).json(templates);
        } catch (error) {
            res.status(500).json({message: "Failed to search templates.", error:error});
        }       
    }
    else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
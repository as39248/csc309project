import { verifyToken } from "../../../utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'PUT'){
        const user = verifyToken(req.headers.authorization);

        if  (!user){
            return res.status(401).json({message: "Unauthorized",});
        }

        const {id} = req.query;
        const {title, explanation, tags, code} = req.body;
        
        // Store the data that needs to be updated
        let updatedData = {};
        
        if (title) {
            updatedData.title = title;
        }
        
        if (explanation) {
            updatedData.explanation = explanation;
        }
        
        if (tags) {
            updatedData.tags = tags;
        }
        
        if (code) {
        		updatedData.code = code;
        }
        try {
            // Update template
            const templates = await prisma.template.update({
                where:{
                    id: Number(id),
                },
                data: updatedData
                });
                
            return res.status(200).json(templates);
        } catch (error) {
            return res.status(500).json({message: "Failed to update template."});
        }  
    }
    else if (req.method === 'DELETE'){
        const user = verifyToken(req.headers.authorization);

        if  (!user){
            return res.status(401).json({message: "Unauthorized",});
        }
        
        const {id} = req.query;
        
        if (!id){
            return res.status(401).json({message: "Template unspecified.",});
        }        
        
        try {
            const templateExists = await prisma.template.findUnique({
                where: {
                    id: Number(id),
                },
            });

            if (templateExists && user.userId != templateExists.id){
                return res.status(401).json({message: "Unauthorized to delete this template.",});
            }
            // Delete a specific template
           const isTemplateDeleted = await prisma.template.delete({
            where: {
                id: Number(id),
            },
           });
           // Check if deletion is successful
           if (isTemplateDeleted){
                return res.status(200).json({message: "Template deletion successful."});
           }
        } catch (error) {
            return res.status(500).json({message: "Failed to delete template.", error: error});
        }  
    }
    else if (req.method === 'GET'){
        const {id} = req.query;
        try {
            // Search for a specific template
           const template = await prisma.template.findUnique({
            where:{
                id: Number(id),
            }
           });
           if (!template){
                return res.status(404).json({message: "Template not found."});
           }
           return res.status(200).json(template);
        } catch (error) {
            res.status(500).json({message: "Failed to find template.", error: error});
        }  
    }
    else {
		return res.status(405).json({ message: "Method not allowed" });
	}
}
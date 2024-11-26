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

        const {title, explanation, tags, code, userId, skip, take} = req.query;
        let tags_obj = [];
        console.log(tags);

        if (tags) {
            // Split tags string into an array if it's a comma-separated string
            const tagsArray = tags.split(',');

            try {
                // Fetch all tags concurrently using Promise.all
                const tagPromises = tagsArray.map(tag => {
                    return prisma.tag.findUnique({
                        where: { name: tag }
                    });
                });

                // Wait for all tag queries to finish
                const tagResults = await Promise.all(tagPromises);

                // Filter out null or undefined results (in case some tags are not found)
                tags_obj = tagResults.filter(tag => tag !== null && tag !== undefined);

                console.log(tags_obj);  // Debugging: log the tags found

            } catch (error) {
                console.error('Error fetching tags:', error);
                return res.status(500).json({ message: 'Failed to fetch tags.', error: error.message });
            }
        }

        let temp = tags_obj.map(tag => tag.id);
        console.log(temp);
        try {
            // search through all templates
            const templates = await prisma.template.findMany({
                take: Number(take) || 10,
                skip: Number(skip) || 0,
                where:{
                    title: title ? {contains: title} : undefined,
                    explanation: explanation ? {contains: explanation} : undefined,
                    userId: userId ? {equals: Number(userId)} : undefined,
                    tags: tags_obj.length > 0 ? { some: { id: { in: tags_obj.map(tag => tag.id) } } } : undefined,
                    code: code ? {contains: code,} : undefined,
                },
                include: {tags: true},
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
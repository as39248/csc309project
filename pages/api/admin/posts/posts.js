import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const user = verifyToken(req.headers.authorization);

    if  (!user){
        return res.status(401).json({message: "Unauthorized",});
    }
	
	// Only allow admin permission to make requests here
    if(user.role !== 'ADMIN'){
        return res.status(401).json({message: "Unauthorized",});
    }

    if (req.method === "GET") {
        // const {skip, take} = req.query
    	// Sort posts by the number of reports in descending order
        try{
            // Fetch all posts
            const posts = await prisma.post.findMany({
                // take: Number(take) || 10,
                // skip: Number(skip) || 0,
                orderBy: {
                    reports:{
                        _count: 'desc',
                    }
                }
            });

            return res.status(200).json(posts);

        }catch(error){
            res.status(500).json({message: "Failed to sort posts by number of reports."});
        }
    }
    else if (req.method === "PUT") {
        try{
            const {postId, isHidden} = req.body;

            if (!postId || !isHidden){
                return res.status(401).json({message: "Required information not given.",});
            }

            const postExists = await prisma.post.findUnique({
                where: {id: postId},
            });

            if (!postExists){
                return res.status(404).json({message: "Comment does not exist."});
            }

            // Change the visibility of the post
            const post = await prisma.post.update({
                where: {id: Number(postId)},
                data: {isHidden: isHidden},
            });

            return res.status(200).json(post);

        }catch{
            return res.status(500).json({message: "Failed to hide post."});
        }
    }
    else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
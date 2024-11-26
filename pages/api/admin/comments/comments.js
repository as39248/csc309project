import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const user = verifyToken(req.headers.authorization);

    if  (!user){
        return res.status(401).json({message: "Unauthorized",});
    }
		
		// Only allow admin permission to make requests
    if(user.role !== 'ADMIN'){
        return res.status(401).json({message: "Unauthorized",});
    }

    if (req.method === "GET") {
        const {skip, take} = req.query
        try{
            // Fetch all comments, sort by the number of reports in descending order
            const comments = await prisma.comment.findMany({
                take: Number(take) || 10,
                skip: Number(skip) || 0,
                orderBy: {
                    reports:{
                        _count: 'desc',
                    }
                }
            });

            return res.status(200).json(comments);

        }catch(error){
            res.status(500).json({message: "Failed to sort comments by number of reports."});
        }
    }
    else if (req.method === "PUT") {
        try{
            const {commentId, isHidden} = req.body;

            if (!commentId || !isHidden){
                return res.status(401).json({message: "Required information not given.",});
            }

            const commentExists = await prisma.comment.findUnique({
                where: {id: commentId},
            });

            if (!commentExists){
                return res.status(404).json({message: "Comment does not exist."});
            }
            
            // Change the visibility of the comment
            const comment = await prisma.comment.update({
                where: {id: Number(commentId)},
                data: {isHidden: isHidden},
            });
            
            if (!comment){
            	return res.status(401).json({message: "Comment did not update properly.",});
            }

            return res.status(200).json(comment);

        }catch(error){
            return res.status(500).json({message: "Failed to hide comment.", error: error});
        }
    }
    else {
		return res.status(405).json({ message: "Method not allowed" });
	}
}
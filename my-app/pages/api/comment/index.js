import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
     if (req.method === "GET") {

        const { postId } = req.body;

        try {
                 
            let comments = await prisma.comment.findMany({
                where: {
                    postId: Number(postId),
                },
                include: {
                    user: true, 
                    replies: true,
                },
            });
            comments = comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            res.status(200).json(comments);


        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to retrieve comments." });
        }

    } 



	else if (req.method === "POST"){
/*
        const user = verifyToken(req.headers.authorization);

        if (!user){
            return res.status(401).json({message: "Unauthorized",});
        }
*/
		const { content, postId, parentId, userId } = req.body;

		if (!content || !postId || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        try {
            const comment = await prisma.comment.create({
                data: {
                    content,
                    postId: Number(postId),
                    userId: Number(userId),
                    parentId: parentId ? Number(parentId) : null,
                    upvotes: 0,
                    downvotes: 0,
                },
            });
            
            res.status(201).json(comment);

        } catch (error) {
            res.status(500).json({ message: "Failed to create a comment." });
        }


	} else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
     if (req.method === "GET") {

        const { postId } = req.query;

        try {
                 
            let comments = await prisma.comment.findMany({
                where: {
                    postId: Number(postId),
                },
                include: {
                    user: true, 
                    post: true,
                    replies: {
                        include: {
                            user:true,
                        },
                    },
                },
            });
            comments = comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            return res.status(200).json(comments);


        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to retrieve comments." });
        }

    } 

	else if (req.method === "POST"){

		const { content, postId, parentId } = req.body;
        const userCheck = verifyToken(req.headers.authorization);
        if (!userCheck) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        const userId = userCheck.userId;

		if (!content || !postId) {
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
                include: {
                    user: true,
                    replies: true,
                },
            });
            
            return res.status(201).json(comment);

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Failed to create a comment." });
        }


	} else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
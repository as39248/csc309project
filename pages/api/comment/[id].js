import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Missing comment ID" });
    }

    if (req.method === "GET") {

        try {
            const comment = await prisma.comment.findUnique({
                where: { id: Number(id) },
                include: {
                    replies: true,
                    post: true, 
                },
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            return res.status(200).json(comment);
        } catch (error) {
            return res.status(500).json({ message: "Failed to retrieve comment." });
        }

    } else if (req.method === "POST") {

        const { action, content } = req.body;
        const userCheck = verifyToken(req.headers.authorization);
        if (!userCheck) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        const userId = userCheck.userId;

        if (action) {
            if (!["upvote", "downvote"].includes(action)) {
                return res.status(400).json({ error: "Invalid action type" });
            }

            try {
                const updateData =
                    action === "upvote"
                        ? { upvotes: { increment: 1 } }
                        : { downvotes: { increment: 1 } };

                const updatedComment = await prisma.comment.update({
                    where: { id: Number(id) },
                    data: updateData,
                });

                return res.status(200).json(updatedComment);
            } catch (error) {
                return res.status(500).json({ message: "Failed to update vote count." });
            }
        } else if (content) {
            
            try {
                const reply = await prisma.comment.create({
                    data: {
                        content,
                        parentId: Number(id),
                        userId: Number(userId),
                        postId: Number(postId),
                        upvotes: 0,
                        downvotes: 0,
                    },
                });

                return res.status(201).json(reply);
            } catch (error) {
                return res.status(500).json({ message: "Failed to create reply." });
            }
        } else {
            return res.status(400).json({ error: "Invalid request: Missing action or reply fields." });
        }

    } else if (req.method === "DELETE") {

        
        try {
            await prisma.comment.delete({
                where: { id: Number(id) },
            });

            return res.status(200).json({ message: "Comment deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Failed to delete comment." });
        }

    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}

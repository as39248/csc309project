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
                    replies: {
                        include: {
                            user: true,
                        },
                    },
                    post: true, 
                },
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            return res.status(200).json(comment);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Failed to retrieve comment." });
        }

    } else if (req.method === "POST") {

        const { rating, content } = req.body;
        const userCheck = verifyToken(req.headers.authorization);
        if (!userCheck) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        const userId = userCheck.userId;
        

        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
            include: {
                upvotedBy: true,
                downvotedBy: true,
            },
        });
        if (!comment) {
            return res.status(404).json({ error: "comment not found" });
        }

        if (rating) {
        
            try {
                if (!["upvote", "downvote"].includes(rating)) {
                    return res.status(400).json({ error: "Invalid rating type" });
                }
                
                const hasUpvoted = comment.upvotedBy.some((user) => user.id === userId);
                const hasDownvoted = comment.downvotedBy.some((user) => user.id === userId);

                if (hasUpvoted || hasDownvoted) {
                    return res.status(400).json({
                        error: "You have already voted on this comment."
                    });
                }

                const updateData =
                    rating === "upvote"
                        ? { upvotes: { increment: 1 },
                            upvotedBy: { connect: { id: userId } }, 
                        }
                        : { downvotes: { increment: 1 },
                            downvotedBy: { connect: { id: userId } },
                        };

                const updatedComment = await prisma.comment.update({
                    where: { id: Number(id) },
                    data: updateData,
                    include: {
                        user: true,
                        replies: {
                            include: {
                                user: true,
                            },
                        }
                    },
                });

                return res.status(200).json(updatedComment);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Failed to update vote count." });
            }
        } else if (content) {
            
            try {
                const reply = await prisma.comment.create({
                    data: {
                        content,
                        parentId: Number(id),
                        userId: Number(userId),
                        postId: Number(comment.postId),
                        upvotes: 0,
                        downvotes: 0,
                    },
                });

                return res.status(201).json(reply);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Failed to create reply." });
            }
        } else {
            return res.status(400).json({ error: "Invalid request: Missing rating or reply fields." });
        }

    } else if (req.method === "DELETE") {
        const userCheck = verifyToken(req.headers.authorization);
        if (!userCheck) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        const userId = userCheck.userId;

        try {

            const comment = await prisma.comment.findUnique({
                where: { id: Number(id) },
            });

            if (!post) {
                return res.status(404).json({ error: "Comment not found" });
            }

            if (post.userId !== userId) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this comment" });
            }
            await prisma.comment.deleteMany({
                where: { postId: Number(id) },
            });
           
            await prisma.template.deleteMany({
                where: { postId: Number(id) },
            });

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

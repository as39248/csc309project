import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

	if (!id) {
		return res.status(400).json({ error: "Missing ID" });

	}

	if (req.method === "GET"){
		
		try {
  
		    const post = await prisma.post.findUnique({
		    	where: {
				    id: Number(id),
			    },
			    include: {
                    tag: true,
                    templates: true, 
                    comments: true, 
                },
		    });

		    if (!post) {
			    return res.status(404).json({ error: "Post not found"});
		    }
		    return res.status(200).json(post);
	    } catch (error) {
	    	return res.status(500).json({ message: "Failed to retrieve post." });
	    }
		


	} else if (req.method === "POST"){
		
		const { action, editTitle, editDescription } = req.body;

		const userCheck = verifyToken(req.headers.authorization);
		if (!userCheck) {
			return res.status(401).json({ error: "Unauthorized user" });
		}
		
		const userId = userCheck.userId;

        // rate the post
        if (action) {
            
            if (!["upvote", "downvote"].includes(action)) {
                return res.status(400).json({ error: "Invalid action type" });
            }

            try {
            	const post = await prisma.post.findUnique({
                    where: { id: Number(id) },
                    include: {
                        upvotedBy: true,
                        downvotedBy: true,
                    },
                });

                if (!post) {
                    return res.status(404).json({ error: "Post not found" });
                }

            	const hasUpvoted = post.upvotedBy.some((user) => user.id === userId);
                const hasDownvoted = post.downvotedBy.some((user) => user.id === userId);

                if (hasUpvoted || hasDownvoted) {
                    return res.status(400).json({
                        error: "You have already voted on this post."
                    });
                }
                const updateData =
                    action === "upvote"
                        ? { upvotes: { increment: 1 },
                            upvotedBy: { connect: { id: userId } },
                        }
                        : { downvotes: { increment: 1 },
                          downvotedBy: { connect: { id: userId } },
                        };

                const updatedPost = await prisma.post.update({
                    where: { id: Number(id) },
                    data: updateData,
                });


                return res.status(200).json(updatedPost);
            } catch (error) {
            	console.log(error);
                return res.status(500).json({ message: "Failed to update vote count." });
            }

        // edit the post
        } else if (editTitle || editDescription) {
           
            try {
            	const post = await prisma.post.findUnique({
                    where: { id: Number(id) },
                });

                if (!post) {
                    return res.status(404).json({ error: "Post not found" });
                }

                if (post.userId !== userId) {
                    return res.status(403).json({ error: "Forbidden: You are not the owner of this post" });
                }

                const data = {};

                if (editTitle) {
                    data.title = editTitle;
                }     

                if (editDescription) {
                    data.description = editDescription;
                }

                const editPost = await prisma.post.update({
                    where: {
                        id: Number(id),
                    },
                    data,
                });

                return res.status(201).json(editPost);
            } catch (error) {
                return res.status(500).json({ message: "Failed to edit post." });
            }
        } else {
            return res.status(400).json({ error: "Invalid request: Missing action or comment fields." });
        }

	} else if (req.method === "DELETE"){
		
		const userCheck = verifyToken(req.headers.authorization);
		if (!userCheck) {
			return res.status(401).json({ error: "Unauthorized user" });
		}
		
		const userId = userCheck.userId;
		try {
			const post = await prisma.post.findUnique({
                where: { id: Number(id) },
            });

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            if (post.userId !== userId) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this post" });
            }
            
			await prisma.post.delete({
			    where: {
				    id: Number(id),
			    },
		    });
		    return res.status(200).json({ message: 'Post Deleted'});
		}
		catch(error){
			console.log(error);
			res.status(500).json({ message: "Failed to delete a post." });

		}
	}
	else {
		res.status(405).json({ message: "Method not allowed" });
	}

 
}
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const user = verifyToken(req.headers.authorization);

    if (!user){
        console.log("User is not authorized");
        return res.status(401).json({message: "Unauthorized"});
    }
	
	// Only allow admin permission to make requests here
    if (user.role !== 'ADMIN'){
        console.log("User is not an admin");
        return res.status(401).json({message: "Unauthorized. Admin only.",});
    }

    if (req.method === "GET") {
        try{
            // Fetch all posts
            const posts = await prisma.post.findMany({
                select: {
                    id: true,
                    title: true,
                    description: true,
                    tag: true,
                    user: { select: { firstName: true, lastName: true } },
                    upvotes: true,
                    downvotes: true,
                    isHidden: true,  // Make sure isHidden is included in the response
                  },
                orderBy: {
                    reports:{
                        _count: 'desc',
                    }
                }
            });
            console.log(posts);
            return res.status(200).json(posts);

        }catch(error){
            res.status(500).json({message: "Failed to sort posts by number of reports."});
        }
    }
    else if (req.method === "PUT") {
        try{
            const {postId, isHidden} = req.body;

            if (!postId){
                console.log("id not given");
                console.log({"postId": postId, "isHidden": isHidden});
                return res.status(401).json({message: "Unable to hide post: Required information not given.",});
            }

            const postExists = await prisma.post.findUnique({
                where: {id: postId},
            });
            
            if (!postExists){
                console.log({"postExists":postExists, "id": postId});
                return res.status(404).json({message: "Post does not exist."});
            }

            // Change the visibility of the post
            const post = await prisma.post.update({
                where: {id: Number(postId)},
                data: {isHidden: isHidden || false},
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
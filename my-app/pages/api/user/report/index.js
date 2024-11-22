import { PrismaClient } from "@prisma/client";
import { comparePassword, generateToken, verifyToken } from "../../../../utils/auth";
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST'){
        try{
        		const user = verifyToken(req.headers.authorization);
        		if(!user){
        			return res.status(401).json({message: "Unauthorized."});
        		
        		}
        		const role = user.role;
            const {explanation, postIdStr, commentIdStr} = req.body;

            if (role !== 'USER' && role !== 'ADMIN'){
                return res.status(401).json({message: "User is not permitted to make this request."});
            }
        	
            if ((!postIdStr) && (!commentIdStr)){
                return res.status(400).json({message: "No post or comment was reported."});
            }
            
        
            let data = {};
                        
        
            if (postIdStr){
            	
            	 const postId = Number(postIdStr);     
                const post = await prisma.post.findUnique({
                where: {id: postId}});
                if(post){
						data.post = post;  
						data.postId = postId;              
                }
            }
                       	       
            if (commentIdStr){
            	 const commentId = Number(commentIdStr);
                const comment = await prisma.comment.findUnique({
                where:{id: commentId}});
                if(comment){
						data.comment = comment;  
						data.commentId = commentId;              
                }
            }
                    
            if (explanation){
                data.explanation = explanation;
            }
                         
                 return res.status(201).json({message: data});
            const report = await prisma.report.create({
                data: data,
            });
                                
            return res.status(201).json(report);
         
        } catch(error){
            res.status(500).json({message: "Failed to create a new report.", error: error});
        }
    }
    else {
		res.status(405).json({ message: "Method not allowed" });
	}
    
}
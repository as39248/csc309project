import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "GET") {

		const { search } = req.query;

		try {
			let posts = await prisma.post.findMany({
				where: {
					OR: [
						{ title: { contains: search } },
        				{ description: { contains: search} },
        				{ tag: { name: { contains: search} } },
        				{ templates: { some: { title: { contains: search} } } },
					],
				},
				include: {
            tag: true,
            templates: true,
        },
			});
			posts = posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
			res.status(200).json(posts);
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: "Failed to retrieve posts." });
		}

	} else if (req.method === "POST"){
	  
		const { title, description, tagName, templates} = req.body;
		const userCheck = verifyToken(req.headers.authorization);
		if (!userCheck) {
			return res.status(401).json({ error: "Unauthorized user" });
		}
		const userId = userCheck.userId;

		if (!title || !description || !tagName) {
		    return res.status(400).json({ error: "Missing required fields" });
		}
		try {

			const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
           });
          
          if (!user) {
            return res.status(400).json({ error: 'User not found' });
          }
          let uid = user.id;

          let tag = await prisma.tag.findUnique({
            where: { name: tagName },
           });
          
          if (!tag) {
            tag = await prisma.tag.create({
            	data: {
            		name: tagName,
            	},
            })
          }
          let tid = tag.id;

         
			const post = await prisma.post.create({
			    data : {
				    title,
				    description,
				    tagId: tid,
				    templates: templates ? { connect: templates.map((id) => ({ id })) } : undefined,
				    upvotes: 0,
				    downvotes: 0,
				    userId: userId,
				    isHidden: false,

			    },
		    });
		    res.status(201).json(post);
		}
		catch(error){
			console.error("Error creating post:", error); 
			res.status(500).json({ message: "Failed to create a post." });

		}
	}

	else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
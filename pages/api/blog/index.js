import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "GET") {

  const { title, content, tag, template } = req.query;

  try {
   
    let whereClause = {
      AND: [],
    };

    if (title) {
      whereClause.AND.push({ title: { contains: title, } });
    }

    if (content) {
      whereClause.AND.push({ description: { contains: content,  } });
    }

    if (tag) {
      whereClause.AND.push({ tag:  { contains: tag,  } });
    }

    if (template) {
      whereClause.AND.push({
        templates: {
          some: {
            title: { contains: template, },
          },
        },
      });
    }

    const posts = await prisma.post.findMany({
      where: whereClause.AND.length > 0 ? whereClause : undefined,
      include: {
        templates: true,
        user: {
        	select: {
        		firstName: true,
        		lastName: true,
        	},
        },
      },
    });
    
    const sortedPosts = posts.sort((a, b) => 
      (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
    );

    res.status(200).json(sortedPosts);
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
		    return res.status(444).json({ error: "Missing required fields" });
		}
		try {

			const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
           });
          
          if (!user) {
            return res.status(400).json({ error: 'User not found' });
          }
          let uid = user.id;


         
			const post = await prisma.post.create({
			    data : {
				    title,
				    description,
				    tag: tagName,
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
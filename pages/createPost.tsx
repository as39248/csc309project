import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CreatePostForm from "../components/CreatePost";

const CreatePostPage: React.FC = () => {
  
  const router = useRouter();
  const handlePostSubmit = async (postData: {
    title: string;
    description: string;
    tagName: string;
    templates?: string[];
  }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Unauthorized");
      }

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const createdPost = await response.json();
      
      console.log("Post created successfully:", createdPost);
      console.log("Post created successfully:", createdPost);

      
      router.push(`/blog/${createdPost.id}`);
     
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-7xl p-8 bg-white rounded shadow flex flex-col items-center">
        <div className="flex justify-between w-full">
          <Link href="/blogs"
          className="text-blue-500 hover:underline mb-4">
            Return
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-black mb-4">Create a New Post</h1>
        <CreatePostForm onSubmit={handlePostSubmit} />
      </div>
    </div>
  );
};

export default CreatePostPage;

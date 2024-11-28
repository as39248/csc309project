import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EditPost from "../components/EditPost";

interface Post {
  id: number;
  title: string;
  description: string;
  tag: string;
  upvotes: number;
  downvotes: number;
}

const EditPostPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      console.log("Fetching post for id:", id); // Debugging line
      fetchPost(id as string);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/blog/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const data: Post = await response.json();
      setPost(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Failed to fetch post.");
    }
  };

  const handleEditSubmit = async (updatedPost: {
    title: string;
    description: string;
    tagName: string;
    templates?: string[];
  }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`/api/blog/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          editTitle: updatedPost.title,
          editDescription: updatedPost.description,
          editTag: updatedPost.tagName,
          editTemplate: updatedPost.templates, // Pass updated templates
        }),
      });

      if (!response.ok) throw new Error("Failed to update post");
      const updatedData = await response.json();
      setPost(updatedData);
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Failed to update post.");
    }
  };


  const handleEditCancel = () => {
    router.push(`/blog/${id}`);
  };



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-3xl p-6 bg-white rounded shadow mt-8">
        {post ? (
          <EditPost
            post={{
              id: post.id,
              title: post.title,
              description: post.description,
              tagName: post.tag,
              templates: post.templates || [],
            }}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-500">Loading post...</p>
        )}
      </div>
    </div>
  );
};

export default EditPostPage;

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";

interface Post {
    id: number;
    title: string;
    description: string;
    tag: string;
    user: { firstName: string; lastName: string };
    upvotes: number;
    downvotes: number;
    isHidden: boolean;
}

const AdminPostPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [results, setResults] = useState<Post[]>([]); 
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
},);

  const handlePostVisibility = async (postId: number, isHidden: boolean) => {
        setErrorMessage("");
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setErrorMessage("Unauthorized. Only admin are allowed.");
            return;
        }

        const response = await fetch(`/api/admin/posts/posts`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId, isHidden}),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Failed to fetch posts.");
          return;
        }

        if (isHidden){
            setErrorMessage("Post is now visible");
        }
        else{
            setErrorMessage("Post is now hidden");
        }
        
  };

  const fetchPosts = async () => {
    try{
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setErrorMessage("Unauthorized. Only admin are allowed.");
          return;
        }

        const response = await fetch(`/api/admin/posts/posts`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Failed to fetch posts.");
          return;
        }

        setResults(data);
    }catch(error){
        setErrorMessage("Fetching posts went wrong.");
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold text-center mb-6 text-black pt-4">Controversial Posts</h2>
      <h3 className='text-center mb-6 text-black'>Posts are listed from most controversial to least controversial</h3>

      {/* Results*/}
      <div className="mt-8 w-full max-w-3xl mb-4">
        {results.length > 0 ? (
          <ul className="space-y-4">
            {results.map((post) => (
              <li
                key={post.id}
                className="p-4 bg-white rounded shadow cursor-pointer"
              >
                <h2 className="text-lg font-bold text-blue-500 hover:underline">
                  {post.title}
                </h2>
                {/* <p className="text-gray-500 text-xs mt-0">
                  By {post.user.firstName} {post.user.lastName}
                </p> */}
                <p className="text-gray-500 text-xs mt-0">
                   {post.description}
                </p>
                <p className="text-gray-700 text-sm mt-3">
                  {post.upvotes} Upvotes | {post.downvotes} Downvotes
                </p>
                <button className="text-red-500 hover:underline" onClick={() =>
                    handlePostVisibility(post.id, post.isHidden)
                }>Change Post Visibility</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 mt-4">
            {errorMessage || "No results found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPostPage;
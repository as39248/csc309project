import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/TemplateSearchBar';
import { useRouter } from "next/router";

interface Comment {
    id: number;
    content: string;
    upvotes: number;
    downvotes: number;
    user: { firstName: string; lastName: string };
    replies: Comment[];
    parentId?: number;
    isHidden: boolean;
}

const AdminCommentPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [results, setResults] = useState<Comment[]>([]); 
  const router = useRouter();

  useEffect(() => {
        fetchComments();
  },);

  const handleCommentVisibility = async (postId: number, isHidden: boolean) => {
    setErrorMessage("");
    const token = localStorage.getItem("accessToken");
    if (!token) {
        setErrorMessage("Unauthorized. Only admin are allowed.");
        return;
    }

    const response = await fetch(`/api/admin/comments`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, isHidden}),
    });

    if (!response.ok) {
      setErrorMessage("Failed to fetch comments.");
      return;
    }

    const data = await response.json();

    if (isHidden){
        setErrorMessage("Comment is now visible");
    }
    else{
        setErrorMessage("Comment is now hidden");
    }
    
};

  const fetchComments = async () => {
    try{
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setErrorMessage("Unauthorized. Only admin are allowed.");
          return;
        }

        const response = await fetch(`/api/admin/comments`);

        if (!response.ok) {
          setErrorMessage("Failed to fetch comments.");
          return;
        }

        const data = await response.json();

        setResults(data);
    }catch(error){
        setErrorMessage("Fetching comments went wrong.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold text-center mb-6 text-black">Controversial Comments</h2>
      <h3 className='text-center mb-6 text-black'>Comments are listed from most contrversial to least controversial</h3>

      {/* Results*/}
      <div className="mt-8 w-full max-w-3xl mb-4">
        {results.length > 0 ? (
          <ul className="space-y-4">
            {results.map((comment) => (
              <li
                key={comment.id}
                className="p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => handleCommentVisibility(comment.id, comment.isHidden)} 
              >
                <h2 className="text-lg font-bold text-blue-500 hover:underline">
                  {comment.content}
                </h2>
                <p className="text-gray-500 text-xs mt-0">
                  By {comment.user.firstName} {comment.user.lastName}
                </p>
                <p className="text-gray-700 text-sm mt-3">
                  {comment.upvotes} Upvotes | {comment.downvotes} Downvotes
                </p>
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

export default AdminCommentPage;
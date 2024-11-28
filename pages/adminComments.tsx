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
  },[]);

  const handleCommentVisibility = async (postId: number, isHidden: boolean) => {
    let isHiddenValue = isHidden;
    // if (typeof(isHidden) !== 'boolean'){
    //   isHiddenValue = false;
    // }
    setErrorMessage("");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Unauthorized. Only admin are allowed.");
      return;
    }

    const response = await fetch(`/api/admin/comments/comments`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, isHidden}),
    });
    const data = await response.json();
    if (!response.ok) {
      setErrorMessage(data.message || "Failed to fetch comments.");
      return;
    }

    if (isHiddenValue === true){
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

        const response = await fetch(`/api/admin/comments/comments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Failed to fetch comments.");
          return;
        }
        setResults(data);
    }catch(error){
        setErrorMessage("Fetching comments went wrong.");
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold text-center mb-6 text-black pt-4">Controversial Comments</h2>
      <h3 className='text-center mb-6 text-black'>Comments are listed from most controversial to least controversial</h3>
      <p className="text-red-500 mt-4">
          {errorMessage}
      </p>
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
                <p className="text-gray-700 text-sm mt-3">
                  {comment.upvotes} Upvotes | {comment.downvotes} Downvotes
                </p>
                <button className="text-red-500 hover:underline" onClick={() =>
                    handleCommentVisibility(comment.id, comment.isHidden)
                }>Change Comment Visibility</button>
                {comment.isHidden && (<p className='text-blue-300 mt-2'>This post is hidden</p>)}
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
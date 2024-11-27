import React, { useState } from "react";
import SearchBar from "../components/SearchBar";


interface Post {
  id: number;
  title: string;
  description: string;
  tag: { name: string }; 
  upvotes: int;
  downvotes: int;
}

interface Comment {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  user: { firstName: string; lastName: string };
  replies: Comment[];
  parentId?: number;
}

const App: React.FC = () => {
  const [results, setResults] = useState<Post[]>([]); 
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); 
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>(""); 
  const [isPosting, setIsPosting] = useState<boolean>(false); 
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const fetchPost = async (id: number) => {
    try {
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const post: Post = await response.json();
      setSelectedPost(post); 
      setError(null);
      fetchComments(id)
    } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message);
    }
  };

  const fetchComments = async (id: number) => {
    try {
      const response = await fetch(`/api/comment?postId=${id}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
        console.error("Error fetching comments:", err);
        setError(err.message);
    }
  };

  const handleSearch = async ({ title, content, tag, template }: { title?: string; content?: string; tag?: string; template?: string }) => {
    try {
      const query = new URLSearchParams();
      if (title) query.append("title", title);
      if (content) query.append("content", content);
      if (tag) query.append("tag", tag);
      if (template) query.append("template", template);

      const response = await fetch(`/api/blog?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: Post[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };


  const handlePostClick = (id: number) => {
    fetchPost(id); 
  };

  const handleBackToResults = () => {
    setSelectedPost(null); 
  };

  const handleBlogVote = async (id: number, action: "upvote" | "downvote") => {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/blog/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action }), 
        });
        if (!response.ok) {
            throw new Error("Failed to update vote");
        }
        const updatedPost = await response.json();
        setSelectedPost(updatedPost);
    } catch (error) {
        console.error("Error updating vote:", error);
        setError("Failed to update vote");
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(token);
      const response = await fetch(`/api/blog/${postId}`, {
        method: "DELETE",
        headers: {
                Authorization: `Bearer ${token}`,
            },
       
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      setResults((prevResults) => prevResults.filter((post) => post.id !== postId));
      setSelectedPost(null); 
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    }
  };
  const handleNewCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return; 

    try {
      setIsPosting(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, postId: selectedPost?.id }), 
      });

      if (!response.ok) throw new Error("Failed to post comment");
      const newPostedComment = await response.json();

      setComments((prevComments) => [...prevComments, newPostedComment]);
      setNewComment(""); 
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment.");
    } finally {
      setIsPosting(false);
    }
  }; 


  const handleCommentVote = async (commentId: number, action: "upvote" | "downvote") => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Unauthorized");
      }

      const response = await fetch(`/api/comment/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: action }),
      });

      if (!response.ok) {
        throw new Error("Failed to rate comment");
      }

      const updatedComment = await response.json();
   
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );
    } catch (error) {
      console.error("Error rating comment:", error);
      setError("Failed to rate comment.");
    }
  };


  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return;

    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/comment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                content: replyContent,
                postId: selectedPost?.id,
                parentId,
            }),
        });

        if (!response.ok) throw new Error("Failed to post reply");
        const newReply = await response.json();

        setComments((prevComments) =>
            prevComments.map((comment) =>
                comment.id === parentId
                    ? { ...comment, replies: [...comment.replies, newReply] }
                    : comment
            )
        );

        setReplyingTo(null);
        setReplyContent(""); 
    } catch (error) {
        console.error("Error posting reply:", error);
        setError("Failed to post reply.");
    }
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Search Bar */}
      <div className="w-full max-w-md">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Results or Post Details */}
      <div className="mt-8 w-full max-w-3xl">
        {selectedPost ? (
          <div className="p-6 bg-white rounded shadow">
            <button
              onClick={handleBackToResults}
              className="text-blue-500 hover:underline mb-4"
            >
              Back to Results
            </button>
            {/* Delete Button */}
            <div className="mt-1 flex justify-end">
              <button
                onClick={() => handleDeletePost(selectedPost.id)}
                className="bg-gray-100 text-red-600 border border-gray-400 px-4 py-2 rounded hover:bg-red-600 hover:text-gray-100 focus:outline-none"
              >
                Delete Post
              </button>
            </div>
            <h1 className="text-2xl text-gray-700 font-bold">{selectedPost.title}</h1>
            <p className="mt-4 text-gray-700">{selectedPost.description}</p>
            {selectedPost.tag && (
              <p className="mt-2 text-sm text-gray-500">#{selectedPost.tag.name}</p>
            )}

            {/* Upvote and Downvote Buttons */}
            <div className="mt-4 flex space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  className="px-1 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => handleBlogVote(selectedPost.id, "upvote")}
                >
                  Upvote
                </button>
                <span className="text-gray-700">{selectedPost.upvotes}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-1 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleBlogVote(selectedPost.id, "downvote")}
                >
                  Downvote
                </button>
                <span className="text-gray-700">{selectedPost.downvotes}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-xl text-gray-700 font-semibold ">Comments</h2>
              {comments.length > 0 ? (
                <ul className="mt-4 space-y-4">
                  {comments.map((comment) => (
                    <li key={comment.id} className="p-4 bg-gray-100 rounded shadow">
                      <div>
                        <strong className="text-black">
                          {comment.user.firstName} {comment.user.lastName}
                        </strong>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    
                      {/* Upvote and Downvote Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-1 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          onClick={() => handleCommentVote(comment.id, "upvote")}
                        >
                          Upvote
                        </button>
                        <span className="text-gray-500">{comment.upvotes} </span>
                        <button
                          className="px-1 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          onClick={() => handleCommentVote(comment.id, "downvote")}
                        >
                          Downvote
                        </button>
                        <span className="text-gray-500">{comment.downvotes} </span>
                      </div>

                      {/* Reply Button */}
                      <button
                        className="text-blue-500 hover:underline text-sm mt-2"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        Reply
                      </button>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-4">
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            rows={2}
                            placeholder="Write your reply here..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault(); 
                              handleReplySubmit(comment.id);
                            }
                          }}
                          />
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
                            onClick={() => handleReplySubmit(comment.id)}
                          >
                            Post Reply
                          </button>
                        </div>
                      )}

                      {/* Display Replies */}
                      {comment.replies.length > 0 && (
                        <ul className="mt-2 pl-4 border-l-2 border-gray-300 space-y-2">
                          {comment.replies.map((reply) => (
                            <li key={reply.id} className="p-2 bg-white rounded shadow">
                              <div>
                                <strong className="text-black">
                                    {reply.user ? `${reply.user.firstName} ${reply.user.lastName}` : "Unknown User"}
                                </strong>
                              </div>
                              <p className="text-gray-600">{reply.content}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-gray-500">No comments yet.</p>
              )}
              {/* Comment Input Section */}
              <div className="mt-6">
                <form onSubmit={handleNewCommentSubmit} className="flex flex-col space-y-2">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    rows={3}
                    placeholder="Write your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); 
                        handleNewCommentSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isPosting}
                    className={`px-4 py-2 rounded ${
                      isPosting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {isPosting ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {results.map((post) => (
              <li
                key={post.id}
                className="p- bg-white rounded shadow cursor-pointer"
                onClick={() => handlePostClick(post.id)}
              >
                <h2 className="block hover:underline text-lg font-bold text-blue-500 mb-1">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {post.upvotes} Upvotes | {post.downvotes} Downvotes
                </p>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default App;

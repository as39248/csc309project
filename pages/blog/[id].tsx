import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface Post {
  id: number;
  title: string;
  description: string;
  tag: { name: string };
  upvotes: number;
  downvotes: number;
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

const BlogDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchPost(id as string);
      fetchComments(id as string);
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

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/comment?postId=${postId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to fetch comments.");
    }
  };

  const handleBlogVote = async (action: "upvote" | "downvote") => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`/api/blog/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Failed to update vote");

      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error("Error updating vote:", err);
      setError("Failed to update vote.");
    }
  };

  const handleNewCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsPosting(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, postId: id }),
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

  const handleCommentVote = async (
    commentId: number,
    action: "upvote" | "downvote"
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`/api/comment/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: action }),
      });

      if (!response.ok) throw new Error("Failed to rate comment");

      const updatedComment = await response.json();
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );
    } catch (err) {
      console.error("Error rating comment:", err);
      setError("Failed to rate comment.");
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent,
          postId: id,
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
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Failed to post reply.");
    }
  };

  const handleEditPost = () => {
    if (post) {
      router.push({
        pathname: `/editPost`,
        query: {
          id: post.id,
          title: post.title,
          description: post.description,
          tagName: post.tag.name,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-3xl p-6 bg-white rounded shadow mt-8">
        {/* Return Button */}
        <button
          onClick={() => router.push("/blogs")}
          className="text-blue-500 hover:underline mb-4"
        >
          Back to Results
        </button>
        

        {post ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
            <p className="mt-4 text-gray-700">{post.description}</p>
            {post.tag && (
              <p className="mt-2 text-sm text-gray-500">#{post.tag.name}</p>
            )}
            <div className="mt-4 flex space-x-4">
              <button
                className="text-blue-500 hover:underline mb-4"
                onClick={() => handleEditPost()}
              >
                Edit
              </button>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleBlogVote("upvote")}
              >
                Upvote {post.upvotes}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleBlogVote("downvote")}
              >
                Downvote {post.downvotes}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
              {comments.length > 0 ? (
                <ul className="mt-4 space-y-4">
                  {comments
                    .filter((comment) => comment.parentId === null) 
                    .map((comment) => (
                      <li
                        key={comment.id}
                        className="p-4 bg-gray-100 rounded shadow"
                      >
                        <div>
                          <strong className="text-black">
                            {comment.user.firstName} {comment.user.lastName}
                          </strong>
                        </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="flex space-x-4 mt-2">
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() =>
                            handleCommentVote(comment.id, "upvote")
                          }
                        >
                          Upvote {comment.upvotes}
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() =>
                            handleCommentVote(comment.id, "downvote")
                          }
                        >
                          Downvote {comment.downvotes}
                        </button>
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => setReplyingTo(comment.id)}
                        >
                          Reply
                        </button>
                      </div>
                      {replyingTo === comment.id && (
                        <div className="mt-2">
                          <textarea
                            className="w-full p-2 border text-black border-gray-300 rounded"
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) =>
                              setReplyContent(e.target.value)
                            }
                          />
                          <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => handleReplySubmit(comment.id)}
                          >
                            Post Reply
                          </button>
                        </div>
                      )}
                      {comment.replies.length > 0 && (
                        <ul className="mt-2 pl-4 border-l-2 border-gray-300 space-y-2">
                          {comment.replies.map((reply) => (
                            <li
                              key={reply.id}
                              className="p-2 bg-white rounded shadow"
                            >
                              <div>
                                <strong className="text-black">
                                  {reply.user.firstName} {reply.user.lastName}
                                </strong>
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-4">No comments yet.</p>
              )}

              {/* Add Comment */}
              <form
                onSubmit={handleNewCommentSubmit}
                className="mt-4 flex flex-col space-y-4"
              >
                <textarea
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isPosting}
                  className={`px-4 py-2 text-white rounded ${
                    isPosting
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isPosting ? "Posting..." : "Post Comment"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <p className="text-gray-500">{error || "Loading post..."}</p>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;

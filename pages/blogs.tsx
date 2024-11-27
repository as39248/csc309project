import React, { useState } from "react";
import { useRouter } from "next/router";
import SearchBar from "../components/SearchBar";

interface Post {
  id: number;
  title: string;
  description: string;
  user: { firstName: string; lastName: string };
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

const Blogs: React.FC = () => {
  const router = useRouter(); 
  const [results, setResults] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async ({
    title,
    content,
    tag,
    template,
  }: {
    title?: string;
    content?: string;
    tag?: string;
    template?: string;
  }) => {
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
      setError("Failed to fetch results.");
    }
  };

  const handlePostClick = (id: number) => {
    router.push(`/blog/${id}`);
  };

  const handleCreatePost = () => {
    router.push("/createPost");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Post Button */}
      <div className="flex justify-between items-center w-full max-w-3xl mt-4 mb-4">
        <button
          onClick={handleCreatePost}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Post
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4 w-full max-w-md">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Search Results */}
      <div className="mt-8 w-full max-w-3xl mb-4">
        {results.length > 0 ? (
          <ul className="space-y-4">
            {results.map((post) => (
              <li
                key={post.id}
                className="p-4 bg-white rounded shadow cursor-pointer"
                onClick={() => handlePostClick(post.id)} 
              >
                <h2 className="text-lg font-bold text-blue-500 hover:underline">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-xs mt-0">
                  By {post.user.firstName} {post.user.lastName}
                </p>
                <p className="text-gray-700 text-sm mt-3">
                  {post.upvotes} Upvotes | {post.downvotes} Downvotes
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-4">
            {error || "No results found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Blogs;

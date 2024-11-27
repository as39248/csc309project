import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface EditPostProps {
  post: {
    id: number;
    title: string;
    description: string;
    tagName: string;
  };
  onSubmit: (updatedPost: { title: string; description: string; tagName: string }) => void;
  onCancel: () => void;
}

const EditPost: React.FC<EditPostProps> = ({ post, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    setTitle(post.title);
    setDescription(post.description);
    setTagName(post.tagName);
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !tagName) {
      setError("All fields are required.");
      return;
    }

    onSubmit({ title, description, tagName });
    router.push(`/blog/${post.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full p-4 bg-white rounded shadow"
    >
      <h2 className="text-lg font-bold text-black">Edit Post</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 border border-gray-300 text-black rounded"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full h-40 p-2 border border-gray-300 text-black rounded"
      ></textarea>
      <input
        type="text"
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
        placeholder="Tag"
        className="w-full p-2 border border-gray-300 text-black rounded"
      />
      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditPost;

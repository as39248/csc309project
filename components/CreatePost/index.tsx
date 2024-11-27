import React, { useState } from "react";

interface CreatePostFormProps {
  onSubmit: (postData: {
    title: string;
    description: string;
    tagName: string;
    templates?: string[];
  }) => void;
}

const CreatePost: React.FC<CreatePostFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagName, setTagName] = useState("");
  const [templates, setTemplates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !tagName) {
      setError("All fields are required.");
      return;
    }

    onSubmit({ title, description, tagName, templates });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full p-4 bg-white rounded shadow"
    >
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full h-40 p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Tag"
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Template (optional)"
        value={templates.join(", ")}
        onChange={(e) =>
          setTemplates(e.target.value.split(",").map((t) => t.trim()))
        }
        className="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Post
      </button>
    </form>
  );
};

export default CreatePost;

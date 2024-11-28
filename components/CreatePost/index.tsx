import React, { useState, useEffect } from "react";

interface Template {
  id: string;
  title: string;
}

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
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates"); // Adjust endpoint as needed
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data: Template[] = await response.json();
        setAvailableTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateToggle = (templateId: string) => {
    setTemplates((prevTemplates) =>
      prevTemplates.includes(templateId)
        ? prevTemplates.filter((id) => id !== templateId)
        : [...prevTemplates, templateId]
    );
  };

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
      <div>
        <h3 className="text-lg font-bold mb-2">Select Templates</h3>
        <div className="space-y-2">
          {availableTemplates.map((template) => (
            <label key={template.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={templates.includes(template.id)}
                onChange={() => handleTemplateToggle(template.id)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded"
              />
              <span className="text-black">{template.title}</span>
            </label>
          ))}
        </div>
      </div>
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

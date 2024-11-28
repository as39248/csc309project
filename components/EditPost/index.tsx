import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface Template {
  id: string;
  title: string;
}

interface EditPostProps {
  post: {
    id: number;
    title: string;
    description: string;
    tagName: string;
    templates: Template[]; 
  };
  onSubmit: (updatedPost: {
    title: string;
    description: string;
    tagName: string;
    templates?: string[];
  }) => void;
  onCancel: () => void;
}

const EditPost: React.FC<EditPostProps> = ({ post, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [tagName, setTagName] = useState(post.tagName);
  const [templates, setTemplates] = useState<string[]>([]); // IDs of selected templates
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates"); 
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data: Template[] = await response.json();
        setAvailableTemplates(data);

        // Pre-select templates based on the post data
        const preSelectedTemplates = post.templates.map((template) => template.id);
        setTemplates(preSelectedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [post.templates]);


  const handleTemplateToggle = (templateId: string) => {
    setTemplates((prevTemplates) =>
      prevTemplates.includes(templateId)
        ? prevTemplates.filter((id) => id !== templateId)
        : [...prevTemplates, templateId]
    );
    console.log("Selected templates:", templates);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !tagName) {
      setError("All fields are required.");
      return;
    }
    onSubmit({ title, description, tagName, templates });
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
{/*
      
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
*/}
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

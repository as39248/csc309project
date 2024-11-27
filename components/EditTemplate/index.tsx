import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface EditTemplateProps {
    template: {
        id: number,
        title: string;
        explanation: string;
        tags: string;
        code: string;
    }
  onSubmit: (updatedTemplate: { title: string; explanation: string; tags: string; code:string; }) => void;
  onCancel: () => void;
}

const EditTemplate: React.FC<EditTemplateProps> = ({ template, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTag] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    setTitle(template.title);
    setExplanation(template.explanation);
    setTag(template.tags);
    setCode(template.code);
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !explanation && !tags && !code) {
      setError("At least 1 field is required.");
      return;
    }

    onSubmit({ title, explanation, tags, code});
    router.push(`/templates/${template.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full p-4 bg-white rounded shadow"
    >
      <h2 className="text-lg font-bold text-black">Edit Template</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 border border-gray-300 text-black rounded"
      />
      <textarea
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Explanation"
        className="w-full h-40 p-2 border border-gray-300 text-black rounded"
      ></textarea>
      <input
        type="text"
        value={tags}
        onChange={(e) => setTag(e.target.value)}
        placeholder="tags"
        className="w-full p-2 border border-gray-300 text-black rounded"
      />
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code"
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

export default EditTemplate;

import React, { useState } from 'react';
import SearchBar from '@/components/TemplateSearchBar';

interface Template {
  id: number,
  title: string;
  explanation: string;
  tag: { name: string };
  code: string;
  userId: number;
}

const TemplatePage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Template[]>([]); 
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null); 

  const handleSearch = async ({ title, explanation, tag, code, userId, skip }: { title?: string; explanation?: string; tag?: string; code?: string; userId?: number; skip?: number, }) => {
    try {
      const query = new URLSearchParams();
      if (title) query.append("title", title);
      if (explanation) query.append("explanation", explanation);
      if (tag) query.append("tag", tag);
      if (code) query.append("code", code);
      // if (skip) query.append("skip", skip);

      const response = await fetch(`/api/templates?${query.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch results.");
      }
      
    } catch (error) {
      console.error("Error fetching search results:", error);
      setErrorMessage("Error fetching templates.")
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(token);
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setResults((prevResults) => prevResults.filter((template) => template.id !== id));
      setSelectedTemplate(null); 
    } catch (err) {
      console.error("Error deleting post:", err);
      setErrorMessage("Failed to delete post.");
    }
  };

  const handleBackToResults = () => {
    setSelectedTemplate(null); 
  };

  const handleTemplateClick = (id: number) => {
    fetchTemplate(id); 
  };

  const fetchTemplate = async (id: number) => {
    try {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) throw new Error("Failed to fetch template.");
      const template: Template = await response.json();
      setSelectedTemplate(template); 
      setErrorMessage("");
    } catch (err) {
      console.error("Error fetching post:", err);
      setErrorMessage("Failed to fetch template.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold text-center mb-6">Search for Templates</h2>
      {/* Search Bar */}
      <div className="w-full max-w-md">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Results or Post Details */}
      <div className="mt-8 w-full max-w-3xl">
        {selectedTemplate ? (
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
                onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                className="bg-gray-100 text-red-600 border border-gray-400 px-4 py-2 rounded hover:bg-red-600 hover:text-gray-100 focus:outline-none"
              >
                Delete Post
              </button>
            </div>
            <h1 className="text-2xl text-gray-700 font-bold">{selectedTemplate.title}</h1>
            <p className="mt-4 text-gray-700">{selectedTemplate.explanation}</p>
            {selectedTemplate.tag && (
              <p className="mt-2 text-sm text-gray-500">#{selectedTemplate.tag.name}</p>
            )}


          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {results.map((template) => (
              <li
                key={template.id}
                className="p- bg-white rounded shadow cursor-pointer"
                onClick={() => handleTemplateClick(template.id)}
              >
                <h2 className="block hover:underline text-lg font-bold text-blue-500 mb-1">
                  {template.title}
                </h2>
              </li>
            ))}
          </ul>
        )}
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>
    </div>
  );
    
};

export default TemplatePage;
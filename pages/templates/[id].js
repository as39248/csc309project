import React, { useState } from 'react';
import { useRouter } from "next/router";

interface Template {
  id: number,
  title: string;
  explanation: string;
  tag: string;
  code: string;
  userId: number;
}

const SelectedTemplate: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const router = useRouter(); 
    const { id } = router.query;

    useEffect(() => {
        if (id) {
          fetchTemplate(id as string);
        }
    }, [id]);

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
            throw new Error("Failed to delete template");
          }
    
          
          setSelectedTemplate(null); 
        } catch (err) {
          console.error("Error deleting post:", err);
          setErrorMessage("Failed to delete template.");
        }
    };

    const handleBackToResults = () => {
        router.push("@pages/templateSearch");
        setSelectedTemplate(null); 
    };

    const fetchTemplate = async (id: string) => {
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
        <div className="mt-8 w-full max-w-3xl">
        
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
                Delete Template
              </button>
            </div>
            <h1 className="text-2xl text-gray-700 font-bold">{selectedTemplate.title}</h1>
            <p className="mt-4 text-gray-700">{selectedTemplate.explanation}</p>
            {selectedTemplate.tag && (
              <p className="mt-2 text-sm text-gray-500">#{selectedTemplate.tag}</p>
            )}
          </div>
        </div>
    );

};

export default SelectedTemplate;
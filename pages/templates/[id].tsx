import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";

interface Template {
  id: number,
  title: string;
  explanation: string;
  tag: string;
  code: string;
  userId: number;
  isForked: boolean;
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
        router.push("/templateSearch");
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

    const handleForkTemplate = async (id:number) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Unauthorized");
        const Forked = true;

        const rep = await fetch(`/api/templates/${id}`);

        if (!rep.ok) throw new Error("Failed to fetch template for forking.");

        const data1 = await rep.json();

        const {title, explanation, tags, userId, code, isForked} = data1;

        const response = await fetch(`/api/templates`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, explanation, tags, code, Forked })
        });
  
        if (!response.ok) {
          throw new Error("Failed to fork template");
        }
        const data2 = await response.json();
        router.push(`/templates/${data2.id}`);
      
      } catch (err) {
        console.error("Error forking template:", err);
        setErrorMessage("Failed to fork template.");
      }
    };

    const handleUpdateTemplate = async () => {
      router.push(`/editTemplate`);
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
                    
          {selectedTemplate ? (
            <>
              {/* Delete Button */}
              <div className="mt-1 flex justify-end">
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  className="bg-gray-100 text-red-600 border border-gray-400 px-4 py-2 rounded hover:bg-red-600 hover:text-gray-100 focus:outline-none"
                >
                  Delete Template
                </button>
              </div>

              {/* Fork Button */}
              <div className="mt-1 flex justify-end">
                <button
                  onClick={() => handleForkTemplate(selectedTemplate.id)}
                  className="bg-gray-100 text-blue-600 border border-gray-400 px-4 py-2 rounded hover:bg-red-600 hover:text-gray-100 focus:outline-none"
                >
                  Fork Template
                </button>
              </div>

              {/* Update Button */}
              <div className="mt-1 flex justify-end">
                <button
                  onClick={() => handleUpdateTemplate()}
                  className="bg-gray-100 text-blue-600 border border-gray-400 px-4 py-2 rounded hover:bg-red-600 hover:text-gray-100 focus:outline-none"
                >
                  Update Template - only template owner authorized
                </button>
              </div>

              {/* Forked flag */}
              {selectedTemplate.isForked ? (
                <>
                  <div className="mt-1 flex justify-end">
                    <p className="mt-2 text-black"> This template is forked.</p>
                  </div>
                </>):(
                  <p></p>
              )}

              <h1 className="text-2xl text-gray-700 font-bold">{selectedTemplate.title}</h1>
              <p className="mt-4 text-gray-700">{selectedTemplate.explanation}</p>
              {selectedTemplate.tag && (
                <p className="mt-2 text-sm text-gray-500">#{selectedTemplate.tag}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">{errorMessage || "No template selected for viewing."}</p>
          )}
          
        </div>
      </div>
    );

};

export default SelectedTemplate;
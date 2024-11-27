import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";

interface Template {
  id: number,
  title: string;
  explanation: string;
  tags: string;
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
        if (!token){ 
          setErrorMessage("Unauthorized");
          return;
        }

        console.log(token);

        const response = await fetch(`/api/templates/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          setErrorMessage("Failed to delete template");
          return;
        }
        else{
          setSelectedTemplate(null); 
        }   
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

          if (!response.ok) {
            setErrorMessage("Failed to fetch template."); 
            return;
          }

          else{
            const template = await response.json();

            setSelectedTemplate(template); 

            setErrorMessage("");

          }
        } catch (err) {
          console.error("Error fetching template:", err);
          setErrorMessage("Failed to fetch template.");
        }
    };

    const handleForkTemplate = async (id:number) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setErrorMessage("Unauthorized");
          return;
        }
        const Forked = true;

        const rep = await fetch(`/api/templates/${id}`);

        if (!rep.ok) {
          setErrorMessage("Failed to fetch template for forking.");
          return;
        }

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
          setErrorMessage("Failed to fork template");
          return;
        }
        const data2 = await response.json();
        router.push(`/templates/${data2.id}`);
      
      } catch (err) {
        console.error("Error forking template:", err);
        setErrorMessage("Failed to fork template.");
      }
    };

    const handleUpdateTemplate = async () => {
      if (selectedTemplate) {
      router.push({
        pathname: `/editTemplate`,
        query: {
          id: selectedTemplate.id,
          title: selectedTemplate.title,
          explanation: selectedTemplate.explanation,
          tags: selectedTemplate.tags,
          code: selectedTemplate.code,
        },
      });
    }
    };

    return (
      <div className="mt-8 w-full max-w-3xl items-center justify-center min-h-screen">
      
        <div className="p-6 bg-white rounded shadow">
          <button
            onClick={handleBackToResults}
            className="text-blue-500 hover:underline mb-4"
          >
            Back to Results
          </button>

          <p className="mt-2 text-gray-300">*Only the owner of the template can update and delete it</p>
                    
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
                  Update Template
                </button>
              </div>

              {/* Forked flag */}
              {selectedTemplate.isForked ? (
                <>
                  <div className="mt-1 flex justify-end">
                    <p className="mt-2 text-red-700"> This template is forked.</p>
                  </div>
                </>):(
                  <p></p>
              )}

              <h1 className="text-2xl text-gray-700 font-bold">{selectedTemplate.title}</h1>
              <p className="mt-4 text-gray-700">{selectedTemplate.explanation}</p>
              <p className="mt-2 text-sm text-gray-600">Tags: {selectedTemplate.tags}</p>
              <p className="mt-2 text-sm text-gray-500">{selectedTemplate.code}</p>

              {selectedTemplate.tags && (
                <p className="mt-2 text-sm text-gray-500"></p>
              )}
            </>
          ) : (
            <p className="text-gray-500">{errorMessage || "No template selected for viewing."}</p>
          )}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </div>
      </div>
    );
};

export default SelectedTemplate;
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import EditTemplate from "../components/EditTemplate";

interface Template {
  id: number,
  title: string;
  explanation: string;
  tag: string;
  code: string;
}

const EditTemplatePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      console.log("Fetching template for id:", id); // Debugging line
      fetchTemplate(id as string);
    }
  }, [id]);

  const fetchTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        setError("Failed to fetch template");
        return;
      }
      const data: Template = await response.json();
      setTemplate(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching template:", err);
      setError("Failed to fetch template.");
    }
  };

  const handleEditSubmit = async (updatedTemplate: { title: string; explanation: string; tag: string, code:string }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Unauthorized");
        return;
      }

      const response = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedTemplate.title,
          explanation: updatedTemplate.explanation,
          tag: updatedTemplate.tag,
          code: updatedTemplate.code,
        }),
      });

      if (!response.ok) {
        setError("Failed to update template");
        return;
      }
      const updatedData = await response.json();
      setTemplate(updatedData);
    } catch (err) {
      console.error("Error updating template:", err);
      setError("Failed to update template.");
    }
  };

  const handleEditCancel = () => {
    router.push(`/templates/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-3xl p-6 bg-white rounded shadow mt-8">
        {template ? (
          <EditTemplate
            template={{
              id: template.id,
              title: template.title,
              explanation: template.explanation,
              tag: template.tag,
              code: template.code,
            }}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-500">Loading template...</p>
        )}
      </div>
    </div>
  );
};

export default EditTemplatePage;

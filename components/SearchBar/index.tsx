import React, { useState, useEffect } from "react";

interface SearchProps {
  onSearch: (searchParams: { title?: string; content?: string; template?: string }) => void;
}

const SearchBar: React.FC<SearchProps> = ({ onSearch }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [template, setTemplate] = useState("");

  const handleSearch = () => {
    onSearch({ title, content, tag, template });
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setTag("");
    setTemplate("");
    onSearch({}); // Trigger search with no filters
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    handleSearch();
  }, []); 

  return (
    <div className="flex flex-col space-y-1">
      <h1 className="text-5xl font-bold text-black text-center mb-4">Blogs</h1>
      <input
        type="text"
        placeholder="Search by Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border border-gray-300 text-black rounded"
      />
      <input
        type="text"
        placeholder="Search by Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border border-gray-300 text-black rounded"
      />
      <input
        type="text"
        placeholder="Search by Tag"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border border-gray-300 text-black rounded"
      />
      <input
        type="text"
        placeholder="Search by Code Template"
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border border-gray-300 text-black rounded"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Search
      </button>
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
  );
};

export default SearchBar;

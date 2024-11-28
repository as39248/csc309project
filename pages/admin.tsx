import React, { useState } from 'react';
import Link from "next/link";
interface Post {
    id: number;
    title: string;
    description: string;
    tag: { name: string }; 
    upvotes: number;
    downvotes: number;
}
  


const AdminPage: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<Post[]>([]); 

    const getPosts = async () => {
        try {
            const response = await fetch(`/api/admin/posts`);
            const data = await response.json();
            if (!response.ok) setErrorMessage(data.message || 'Fetching posts failed.');
            
        } catch (err) {
            console.error("Error fetching post:", err);
            setErrorMessage("");
        }
    };

    const getComments = async () => {
        try {
            const response = await fetch(`/api/admin/comments`);
            const data = await response.json();
            if (!response.ok) setErrorMessage(data.message || 'Fetching comments failed.');
            
        } catch (err) {
            console.error("Error fetching comments:", err);
            setErrorMessage("");
        }
    };

    return (
        <main>
        <section className="bg-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Admin Page
            </h1>
            <div className="flex justify-center space-x-4">
              <Link href="/adminComments">
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                  Look at controverisal comments
                </button>
              </Link>

              <Link href="/adminPosts">
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                    Look at controverisal posts
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );

    
};

export default AdminPage;
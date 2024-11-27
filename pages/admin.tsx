import React, { useState } from 'react';

interface Post {
    id: number;
    title: string;
    description: string;
    tag: { name: string }; 
    upvotes: number;
    downvotes: number;
}
  
interface Comment {
    id: number;
    content: string;
    upvotes: number;
    downvotes: number;
    user: { firstName: string; lastName: string };
    replies: Comment[];
    parentId?: number;
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

    
};

export default AdminPage;
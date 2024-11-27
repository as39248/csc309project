import React, { useEffect, useState } from "react";

const LoginSuccess: React.FC = () => {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No token found, redirecting to login...");
        window.location.href = "/login"; // Redirect to login if no token
        return;
      }
    };

  }, []);

 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-black">
        Welcome to Scriptorium!
      </h1>
    </div>
  );
};

export default LoginSuccess;

import React, { useState } from "react";
import { useRouter } from "next/router"; // To handle redirects after login

// Define types for form data
interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  // States for form data and error message
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter(); // Router to redirect after successful login

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsLoading(true); // Start loading
    setErrorMessage(""); // Reset error message

    try {
      const response = await fetch("/api/user/login", {
        method: "POST", // POST request to the backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send form data as JSON
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        localStorage.setItem("accessToken", data.accessToken); // For the current session
        localStorage.setItem("refreshToken", data.refreshToken);

        router.push("/ide"); // Redirect to dashboard or another page
      } else {
        // Handle error from backend (e.g., wrong credentials)
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (error) {
      // Handle network errors or unexpected issues
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email" className="block text-lg font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label
              htmlFor="password"
              className="block text-lg font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Optional: Link to signup page */}
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useRouter } from 'next/router'; // to handle redirects after login

// Define types for form data
interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  // States for form data and error message
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
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
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsLoading(true); // Start loading
    setErrorMessage(''); // Reset error message

    try {
      const response = await fetch('/api/login', {
        method: 'POST', // POST request to the backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send form data as JSON
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        localStorage.setItem('accessToken', data.accessToken); // For the current session
        localStorage.setItem("refreshToken", data.refreshToken);

        router.push('/ide'); 
      } else {
        // Handle error from backend (e.g., wrong credentials)
        setErrorMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      // Handle network errors or unexpected issues
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group text-black">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group text-black">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

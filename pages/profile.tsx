import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    avatar: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false); 
  const [popupMessage, setPopupMessage] = useState<string>('');

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAvatarSelection = (avatar: string) => {
    setFormData((prevData) => ({
      ...prevData,
      avatar,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, phoneNumber, email, avatar } = formData;

    if (!firstName && !lastName && !phoneNumber && !email && !avatar) {
      setErrorMessage('At least 1 field is needed to make changes.');
      return;
    }

    const phonePattern = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
    if (phoneNumber && !phonePattern.test(phoneNumber)) {
      setErrorMessage('Phone number is not in a valid form.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('api/user/profile', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, phoneNumber, email, avatar }),
      });

      const data = await response.json();

      if (response.ok) {
        setPopupMessage('Profile updated successfully!');
        setShowPopup(true); 
      } else {
        setErrorMessage(data.message || 'Changing profile failed.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Update Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName" className="block text-lg font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className="w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName" className="block text-lg font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className="w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="block text-lg font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="w-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
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
            />
          </div>

          {/* Avatar Selection */}
          <div className="form-group">
            <label className="block text-lg font-medium mb-2">Select New Profile Picture</label>
            <div className="avatar-selection flex space-x-4">
              {['/avatars/avatar1.png', '/avatars/avatar2.png', '/avatars/avatar3.png'].map(
                (avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className={`w-24 h-24 rounded-full cursor-pointer transition-all duration-300 transform ${
                      formData.avatar === avatar ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => handleAvatarSelection(avatar)}
                  />
                )
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Success</h2>
            <p className="mb-6">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

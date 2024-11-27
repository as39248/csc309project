import React, { useState, useEffect } from "react";
import { AppProps } from "next/app"; // Import AppProps type from Next.js
import "@/styles/globals.css";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  const [isInverted, setIsInverted] = useState(false);
  const [hydrated, setHydrated] = useState(false); // Tracks hydration status

  useEffect(() => {
    setHydrated(true); // Ensure client-side rendering

    // Check if inversion was previously enabled
    const storedTheme = localStorage.getItem("inverted");
    if (storedTheme === "true") {
      document.body.classList.add("inverted");
      setIsInverted(true);
    }
  }, []);

  const toggleInvert = () => {
    const newInversionState = !isInverted;
    setIsInverted(newInversionState);

    if (newInversionState) {
      document.body.classList.add("inverted");
    } else {
      document.body.classList.remove("inverted");
    }

    localStorage.setItem("inverted", newInversionState.toString());
  };

  return (
    <>
      <nav className="flex flex-row bg-blue-900 text-white px-4 py-2 gap-2 flex-wrap">
        <Link href="/">Home</Link>
        <Link href="/IDE">IDE</Link>
        <Link href="/blogs">Blogs</Link>
        <Link href="/templateSearch">Templates</Link>
        <Link href="/profile">Profile</Link>
        {hydrated && (
          <button
            onClick={toggleInvert}
            className="bg-gray-800 hover:bg-gray-700 text-white py-1 px-3 ml-20 rounded"
          >
            {isInverted ? "Light Mode" : "Dark Mode"}
          </button>
        )}
        <div className="flex-1" />
        <Link href="/logout">Logout</Link>
      </nav>
      <Component {...pageProps} />
    </>
  );
}

import React from "react";
import { AppProps } from "next/app";  // Import AppProps type from Next.js
import "@/styles/globals.css";
import Link from "next/link";

// Define your custom App component, using the correct types for Component and pageProps
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="flex flex-row bg-blue-900 text-white px-4 py-2 gap-2 flex-wrap">
        <Link href="/">Home</Link>
        <Link href="/IDE">IDE</Link>
        <Link href="/Blogs">Blogs</Link>
        <Link href="/Templates">Templates</Link>
        <Link href="/Profile">Profile</Link>
        <Link href="/Theme">Change Theme</Link>
        <div className="flex-1" />
        {/* <Link href="/logout">Logout</Link> */}
      </nav>
      <Component {...pageProps} /> {/* Render the page component */}
    </>
  );
}

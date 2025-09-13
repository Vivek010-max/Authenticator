import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white ">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page Not Found</p>
      <Link to="/home" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-yellow-700 transition">Go Home</Link>
    </div>
  );
} 
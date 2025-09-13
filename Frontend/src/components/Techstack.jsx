import React from "react";
import { cn } from "../lib/utils";
import { FaReact, FaNodeJs, FaPython, FaDatabase, FaAws } from "react-icons/fa";

export default function TechStack() {
  const techItems = [
    { name: "React", icon: <FaReact className="h-10 w-10 text-sky-500" /> },
    { name: "Node.js", icon: <FaNodeJs className="h-10 w-10 text-green-500" /> },
    { name: "Python", icon: <FaPython className="h-10 w-10 text-blue-500" /> },
    { name: "Database", icon: <FaDatabase className="h-10 w-10 text-gray-500" /> },
    { name: "AWS", icon: <FaAws className="h-10 w-10 text-orange-500" /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-4xl font-bold text-center text-sky-800 dark:text-sky-200 mb-8">Our Tech Stack</h2>
      <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-12 max-w-2xl">
        Here's a glimpse into the technologies we're using to build our project for the hackathon. We're leveraging these tools to create a robust and scalable solution.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
        {techItems.map((tech) => (
          <div
            key={tech.name}
            className={cn(
              "flex flex-col items-center p-6 rounded-lg transition-transform transform hover:scale-105",
              "bg-white dark:bg-black border border-blue-200 dark:border-neutral-400/70 shadow-lg hover:shadow-xl"
            )}
          >
            <div className="mb-4">
              {tech.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{tech.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
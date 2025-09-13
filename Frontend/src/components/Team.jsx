import React from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

// Animation variant for a gentle fade-in from the bottom
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Team({ className, containerClassName }) {
  // Array of team member data, including social links
  const teamMembers = [
    {
      name: "John Doe",
      role: "Project Lead",
      image: "https://source.unsplash.com/300x300/?man,professional",
      socials: {
        github: "https://github.com/johndoe",
        twitter: "https://twitter.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe",
      },
    },
    {
      name: "Jane Smith",
      role: "UX Designer",
      image: "https://source.unsplash.com/300x300/?woman,professional",
      socials: { github: "#", twitter: "#", linkedin: "#" },
    },
    {
      name: "Alex Johnson",
      role: "Frontend Developer",
      image: "https://source.unsplash.com/300x300/?man,smiling",
      socials: { github: "#", twitter: "#", linkedin: "#" },
    },
    {
      name: "Chris Lee",
      role: "Backend Engineer",
      image: "https://source.unsplash.com/300x300/?man,developer",
      socials: { github: "#", twitter: "#", linkedin: "#" },
    },
    {
      name: "Pat Garcia",
      role: "Data Scientist",
      image: "https://source.unsplash.com/300x300/?man,tech",
      socials: { github: "#", twitter: "#", linkedin: "#" },
    },
    {
      name: "Jordan Brown",
      role: "DevOps Engineer",
      image: "https://source.unsplash.com/300x300/?man,coder",
      socials: { github: "#", twitter: "#", linkedin: "#" },
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Team Section */}
      <section
        className={cn(
          "relative w-full py-28 bg-transparent overflow-hidden",
          className
        )}
        aria-label="Meet the Team"
      >
        <div
          className={cn(
            "relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20",
            containerClassName
          )}
        >
          {/* Main Heading */}
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeInUp}
          >
            <h2 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 leading-tight md:text-6xl">
              Meet the Team
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              A diverse group of passionate individuals dedicated to building
              innovative solutions.
            </p>
          </motion.div>

          {/* Team Member Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
            {teamMembers.map((member, index) => (
              <motion.article
                key={index}
                className="group bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" },
                  },
                }}
              >
                {/* Profile Image with a clean circular crop */}
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-gray-100 transition-colors duration-300">
                  <img
                    src={member.image}
                    alt={`Photo of ${member.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Name and Role */}
                <h3 className="text-2xl font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-indigo-600 mt-1 text-base font-medium tracking-wide">
                  {member.role}
                </p>

                {/* Social Links */}
                <div className="flex justify-center mt-6 space-x-6 text-gray-400 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      aria-label={`${member.name} GitHub`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      <FaGithub size={24} />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      aria-label={`${member.name} Twitter`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      <FaTwitter size={24} />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      aria-label={`${member.name} LinkedIn`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      <FaLinkedin size={24} />
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      
     
    </>
  );
}

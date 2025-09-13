import React from "react";
import ToggelSwitch from "../ui/ToggelSwitch.jsx";
import GeminiWave from "../ui/GeminiWave.jsx";
import { cn } from "../lib/utils";
import Navbar from "../components/Navbar";
import { Hero } from "../components/Hero";
import About from "../components/About";
import GridBackground from "../ui/GridBackground";
import { FeaturedSection } from "../components/FeaturedSection";
import Techstack from "../components/Techstack";
import ImpactFuture from "../components/ImpactFuture";
import Team from "../components/Team";
import BrutalistAccordion from "../components/BrutalistAccordion";
import { motion } from "framer-motion";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandInstagram,
} from "@tabler/icons-react";

function Landing() {
  return (
    <>
      {/* Top Section with Wave and Navbar */}
      <Navbar />
      <GeminiWave>
        <Hero />
      </GeminiWave>

      <div className="selection:bg-sky-400">
        {/* SVG Divider */}
        <div className="relative w-full overflow-hidden bg-white  shadow-black drop-shadow-gray-950 dark:bg-blue-950 leading-none">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-24"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C480,160 960,0 1440,96 L1440,0 L0,0 Z"
              fill="black"
            />
          </svg>
        </div>

        {/* About Section with Grid Background */}
        <GridBackground>
          <div className="max-w-7xl px-6 md:px-12 lg:px-0 py-1">
            <div className="space-y-1">
              <About />
              <FeaturedSection />
              <Techstack />
              <ImpactFuture />

              <div className={cn("flex flex-col md:flex-row items-center justify-center gap-14 lg:gap-24 mt-30 mb-1")}> 
                <BrutalistAccordion />
              </div>
              <Team />
          
            </div>
          </div>
        </GridBackground>

        {/* Footer */}
        <footer className="relative bg-gradient-to-t from-sky-600 via-sky-500 to-blue-400 text-white py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500 ">
          <div className="max-w-7xl mx-auto px-12 md:px-12 lg:px-20 space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Brand */}
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Torna</h2>
                <p className="text-gray-100/90 leading-relaxed">
                  Building innovative, sustainable, and ethical technology for a better world.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
                <ul className="space-y-1.5">
                  <li><a href="/home" className="hover:text-gray-200 transition">Home</a></li>
                  <li><a href="/profile" className="hover:text-gray-200 transition">Profile</a></li>
                  <li><a href="/projects" className="hover:text-gray-200 transition">Projects</a></li>
                  <li><a href="/contact" className="hover:text-gray-200 transition">Contact</a></li>
                </ul>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
                <div className="flex space-x-4">
                  <motion.a whileHover={{ scale: 1.2 }} href="#" aria-label="Twitter">
                    <IconBrandTwitter size={24} />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.2 }} href="#" aria-label="LinkedIn">
                    <IconBrandLinkedin size={24} />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.2 }} href="#" aria-label="GitHub">
                    <IconBrandGithub size={24} />
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.2 }} href="#" aria-label="Instagram">
                    <IconBrandInstagram size={24} />
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-white/30"></div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-100/80 text-sm gap-2 md:gap-0">
              <p>© {new Date().getFullYear()} Torna. All rights reserved.</p>
              <div className="flex space-x-4">
                <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Landing;

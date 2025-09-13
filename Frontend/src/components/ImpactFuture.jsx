import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// This is a minimal, self-contained implementation of a class utility.
// It joins class names together, ignoring any falsey values.
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Define Framer Motion variants for animated elements.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// Main component that combines the animated background and content.
export default function ImpactFuture() {
  const canvasRef = useRef(null);

  // useEffect hook to handle the particle background animation.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const numParticles = 100;

    // Use media query to check for dark mode preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const particleColor = isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
    const lineColorTransparent = isDarkMode ? "rgba(255, 255, 255, " : "rgba(0, 0, 0, ";

    // A utility function to resize the canvas to fit its container.
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Particle class for the background animation.
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = particleColor;
      }

      // Method to update particle position.
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap particles around the screen.
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      // Method to draw the particle.
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles.
    const init = () => {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    // The main animation loop.
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        // Draw lines between nearby particles.
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `${lineColorTransparent}${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };

    // Set up event listeners and initial state.
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    init();
    animate();

    // Clean up event listeners on component unmount.
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    
    <div className="relative w-full rounded-4xl shadow-gray-800 shadow-2xl min-h-screen overflow-hidden bg-gradient-to-l from-sky-200 via-gray-400 to-slate-300  dark:bg-black">
      {/* Canvas for the particle background animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0"></canvas>

      {/* Main content container, styled to be above the canvas */}
      <div className="relative z-10 p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center">
        <motion.div
          className="text-center mb-16 max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100"
            variants={cardVariants}
          >
            A Glimpse into Tomorrow
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl font-light italic text-gray-600 dark:text-gray-300"
            variants={cardVariants}
          >
            Shaping a future powered by bold ideas and seamless innovation.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Card 1: Our Mission */}
          <motion.div
            className="backdrop-blur-md rounded-xl p-8 shadow-xl border bg-white/70 border-gray-200 dark:bg-white/10 dark:border-gray-700/50 hover:scale-[1.02] transition-transform duration-300"
            variants={cardVariants}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Our Mission</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Our core mission is to create a more connected and equitable world through responsible technology.
              We focus on building tools that solve real-world problems and empower communities.
            </p>
            <div className="flex justify-center items-center mt-auto">
              <img
                src="https://www.freecodecamp.org/news/content/images/2021/08/tailwind.png"
                alt="Mission illustration"
                className="w-full h-48 object-cover rounded-md shadow-lg"
              />
            </div>
          </motion.div>

          {/* Card 2: Strategic Roadmap */}
          <motion.div
            className="backdrop-blur-md rounded-xl p-8 shadow-xl border bg-white/70 border-gray-200 dark:bg-white/10 dark:border-gray-700/50 hover:scale-[1.02] transition-transform duration-300"
            variants={cardVariants}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Strategic Roadmap</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Our roadmap includes key initiatives in sustainable AI, ethical data usage, and decentralized networks.
              We are constantly innovating to stay ahead of the curve.
            </p>
            <div className="flex justify-center items-center mt-auto">
              <img
                src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Roadmap illustration"
                className="w-full h-48 object-cover rounded-md shadow-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { HiChevronDown } from 'react-icons/hi';
import Link from 'next/link'; // 1. Add the import for Link

export default function Hero() {
  return (
    <div className="relative h-screen w-full text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source
          src="https://adbess.s3.us-east-2.amazonaws.com/public-assets/adbess_bg_compressed.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 translate-y-[-50px] md:translate-y-0">
        <motion.div
          className="flex items-end justify-center gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex items-baseline justify-center gap-4 mb-2">
            <h1 className="text-5xl sm:text-5xl md:text-5xl lg:text-6xl font-logo font-bold text-sand flex flex-col md:flex-row md:items-baseline md:whitespace-nowrap md:tracking-tight leading-tight">
              <span>ESS Index 2025</span>
            </h1>
          </div>
        </motion.div>

        <motion.p
          className="max-w-2xl text-lg md:text-2xl mb-13 text-clay font-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          AI-Powered Insights for Environmental & Social Standards
        </motion.p>

        {/* Minimal change applied below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {/* 2. Replaced <a> with <Link> and updated the href */}
          <Link
            href="/dashboard"
            className="inline-flex flex-col items-center text-sand hover:text-white transition-colors group"
          >
            <span className="font-tagline text-sm tracking-wider">EXPLORE</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HiChevronDown className="h-8 w-8" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
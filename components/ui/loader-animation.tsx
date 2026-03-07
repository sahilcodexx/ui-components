"use client";
import Container from "../common/container";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const greetings = [
  { lang: "English", text: "Hello" },
  { lang: "Hindi", text: "हेलो" },
  { lang: "French", text: "Bonjour" },
  { lang: "Dutch", text: "Hallo" },
  { lang: "Japanese", text: "こんにちは" },
  { lang: "Spanish", text: "Hola" },
  { lang: "German", text: "Hallo" },
  { lang: "Arabic", text: "مرحبا" },
  { lang: "Thai", text: "สวัสดี" },
  { lang: "Vietnamese", text: "Xin chào" },
  { lang: "Bengali", text: "হ্যালো" },
  { lang: "Urdu", text: "ہیلو" },
];

const LoaderAnimation = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % greetings.length);
    }, 170);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container className="flex items-center justify-center">
      <div className="h-12 flex items-center justify-center">
        <motion.h2
          key={index}
          className="text-3xl "
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          {greetings[index].text}
        </motion.h2>
      </div>
    </Container>
  );
};

export default LoaderAnimation;

"use client";
import { motion } from "framer-motion";

const LoadingDot = {
  display: "block",
  width: "8px",
  height: "8px",
  backgroundColor: "white",
  borderRadius: "50%",
};

const DotTransition = {
  duration: 1,
  yoyo: Infinity,
  ease: "easeIn",
  repeat: Infinity,
};

export default function Loading() {
  return (
    <div className="w-12 h-full relative flex justify-around items-center">
      <motion.div
        style={LoadingDot}
        animate={{
          y: ["0%", "70%", "0%"],
        }}
        transition={{ ...DotTransition, delay: 0.1 }}
      />
      <motion.div
        style={LoadingDot}
        animate={{
          y: ["0%", "70%", "0%"],
        }}
        transition={{ ...DotTransition, delay: 0.3 }}
      />
      <motion.div
        style={LoadingDot}
        animate={{
          y: ["0%", "70%", "0%"],
        }}
        transition={{ ...DotTransition, delay: 0.5 }}
      />
    </div>
  );
}

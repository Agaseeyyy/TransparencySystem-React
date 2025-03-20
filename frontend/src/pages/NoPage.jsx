import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NoPage = () => {
  const navigate = useNavigate();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <motion.div
        className="w-full max-w-md px-8 py-12 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center"
        >
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-900/20">
            <FileQuestion size={40} className="text-rose-600 dark:text-rose-400" />
          </div>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
        >
          404
        </motion.h1>
        
        <motion.div 
          variants={itemVariants}
          className="w-16 h-1 mx-auto my-6 bg-rose-500 dark:bg-rose-400"
        />
        
        <motion.h2 
          variants={itemVariants}
          className="mb-3 text-2xl font-semibold text-slate-800 dark:text-slate-200"
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          variants={itemVariants}
          className="mb-8 text-slate-600 dark:text-slate-400"
        >
          Oops! The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button 
            variant="default"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
            onClick={() => navigate('/')}
          >
            <Home size={16} />
            Go Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NoPage;
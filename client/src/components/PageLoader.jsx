import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = ({ label = "Loading Campus ERP..." }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-500"
        >
            <div className="relative w-24 h-24 mb-4">
                <img
                    src="/Book.gif"
                    alt="Loading..."
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
            >
                <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-cyan-400 dark:to-teal-400">
                    {label}
                </h3>

            </motion.div>
        </motion.div>
    );
};

export default PageLoader;

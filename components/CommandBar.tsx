"use client";

import { Card } from "@/components/ui/card";
import { ListTodo, Clock, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface CommandBarProps {
    total: number;
    inProgress: number;
    underReview: number;
    completed: number;
    overdue: number;
}

export function CommandBar({ total, inProgress, underReview, completed, overdue }: CommandBarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-talabat-brown to-talabat-brown/90 rounded-xl p-6 shadow-xl border-2 border-talabat-orange/20"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-6 w-6 text-talabat-orange" />
                    <h3 className="text-xl font-bold text-white">Command Center</h3>
                </div>
                {overdue > 0 && (
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm"
                    >
                        ⚠️ {overdue} Overdue
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-4 gap-6">
                {/* Total Tasks */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                >
                    <div className="flex items-center justify-between mb-2">
                        <ListTodo className="h-5 w-5 text-talabat-offwhite" />
                        <span className="text-3xl font-bold text-white">{total}</span>
                    </div>
                    <p className="text-talabat-offwhite/80 text-sm font-medium">Total Tasks</p>
                </motion.div>

                {/* In Progress */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-blue-300" />
                        <span className="text-3xl font-bold text-white">{inProgress}</span>
                    </div>
                    <p className="text-blue-200 text-sm font-medium">In Progress</p>
                </motion.div>

                {/* Needs Review - PRIORITY */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    animate={underReview > 0 ? { boxShadow: ["0 0 20px rgba(131, 24, 216, 0.5)", "0 0 30px rgba(131, 24, 216, 0.8)", "0 0 20px rgba(131, 24, 216, 0.5)"] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-talabat-purple/30 backdrop-blur-sm rounded-lg p-4 border-2 border-talabat-purple"
                >
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="h-5 w-5 text-talabat-purple" />
                        <span className="text-3xl font-bold text-white">{underReview}</span>
                    </div>
                    <p className="text-purple-200 text-sm font-medium">⭐ Needs Review</p>
                </motion.div>

                {/* Completed */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30"
                >
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="h-5 w-5 text-talabat-green" />
                        <span className="text-3xl font-bold text-white">{completed}</span>
                    </div>
                    <p className="text-green-200 text-sm font-medium">Completed</p>
                </motion.div>
            </div>
        </motion.div>
    );
}

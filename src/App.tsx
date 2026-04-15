/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, RefreshCw } from 'lucide-react';

interface Question {
  text: string;
  answer: number;
  options: number[];
}

export default function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuestion = useCallback(() => {
    const isMultiplication = Math.random() > 0.5;
    let text = '';
    let answer = 0;

    if (isMultiplication) {
      // Multiplication within 100
      const a = Math.floor(Math.random() * 9) + 2; // 2-10
      const b = Math.floor(Math.random() * (Math.floor(100 / a) - 1)) + 2; // 2 to max possible
      text = `${a} × ${b}`;
      answer = a * b;
    } else {
      // Division within 100
      const b = Math.floor(Math.random() * 9) + 2; // Divisor 2-10
      const ans = Math.floor(Math.random() * (Math.floor(100 / b) - 1)) + 2; // Quotient 2 to max
      const a = b * ans; // Dividend
      text = `${a} ÷ ${b}`;
      answer = ans;
    }

    // Generate options
    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5; // -5 to 5
      const distractor = answer + offset;
      if (distractor > 0 && distractor !== answer) {
        options.add(distractor);
      }
    }

    setQuestion({
      text,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    });
    setFeedback(null);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswer = (selected: number) => {
    if (feedback) return; // Prevent multiple clicks

    if (selected === question?.answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      setFeedback('wrong');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setFeedback(null);
      }, 500);
    }
  };

  if (!question) return null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isShaking ? 'animate-shake' : ''}`}>
      {/* Header / Score */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 flex items-center gap-2 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm"
      >
        <Trophy className="text-yellow-500 w-5 h-5" />
        <span className="font-bold text-lg text-slate-700">得分: {score}</span>
      </motion.div>

      {/* Question Card */}
      <motion.div
        key={question.text}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md aspect-square bg-white rounded-[3rem] shadow-xl shadow-macaron-lavender/20 flex flex-col items-center justify-center p-8 relative overflow-hidden border-8 border-macaron-yellow"
      >
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-macaron-pink/30 rounded-full blur-xl" />
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-macaron-mint/30 rounded-full blur-xl" />

        <h2 className="text-7xl md:text-8xl font-extrabold text-slate-700 tracking-tighter">
          {question.text}
        </h2>
        
        <div className="mt-4 text-slate-400 font-medium text-lg">等于多少呢？</div>
      </motion.div>

      {/* Options Grid */}
      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
        {question.options.map((opt, idx) => (
          <motion.button
            key={`${question.text}-${opt}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleAnswer(opt)}
            className={`
              h-20 rounded-3xl text-3xl font-bold shadow-lg transition-all duration-200
              ${idx === 0 ? 'bg-macaron-pink hover:bg-macaron-pink/80' : ''}
              ${idx === 1 ? 'bg-macaron-mint hover:bg-macaron-mint/80' : ''}
              ${idx === 2 ? 'bg-macaron-yellow hover:bg-macaron-yellow/80' : ''}
              ${idx === 3 ? 'bg-macaron-lavender hover:bg-macaron-lavender/80' : ''}
              text-slate-700 border-b-4 border-black/10 active:border-b-0
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-white/90 backdrop-blur-md px-12 py-6 rounded-full shadow-2xl flex items-center gap-4 border-4 border-macaron-pink">
              <Sparkles className="text-yellow-400 w-10 h-10 animate-bounce" />
              <span className="text-4xl font-black text-macaron-pink tracking-widest">太棒了!</span>
              <Sparkles className="text-yellow-400 w-10 h-10 animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      <button 
        onClick={() => { setScore(0); generateQuestion(); }}
        className="mt-12 text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm font-medium">重新开始</span>
      </button>

      {/* Background blobs */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-macaron-peach/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-macaron-lavender/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-macaron-yellow/40 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

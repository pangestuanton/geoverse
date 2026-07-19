"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import type { QuizQuestion } from "@/types";

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export default function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    onComplete(finalScore);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
      <h3 className="font-bold text-charcoal-500 mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-brand-500" />
        Kuis Modul
      </h3>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-3">
            <p className="font-semibold text-charcoal-400 text-sm">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = submitted && oi === q.correctAnswer;
                const isWrong = submitted && isSelected && oi !== q.correctAnswer;

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all flex items-center gap-3 ${
                      isCorrect
                        ? "border-leaf-400 bg-leaf-50 text-leaf-700"
                        : isWrong
                        ? "border-red-400 bg-red-50 text-red-700"
                        : isSelected
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-stone-200 hover:border-brand-200 hover:bg-brand-50/30 text-charcoal-300"
                    }`}
                  >
                    {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-leaf-500 shrink-0" />}
                    {submitted && isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {!submitted && (
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isSelected ? "border-brand-500 bg-brand-500" : "border-stone-300"}`} />
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            allAnswered
              ? "bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98]"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          }`}
        >
          {allAnswered ? "Kirim Jawaban" : `Jawab semua pertanyaan (${Object.keys(answers).length}/${questions.length})`}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl text-center ${
            score >= 80 ? "bg-leaf-50 border border-leaf-200" : "bg-earth-50 border border-earth-200"
          }`}
        >
          <p className="text-2xl font-extrabold text-charcoal-600 mb-1">
            Skor: {score}%
          </p>
          {score >= 80 ? (
            <p className="text-sm text-leaf-600 font-medium">Hebat! Kamu mendapatkan bonus 10 poin.</p>
          ) : (
            <p className="text-sm text-earth-600">Coba pelajari ulang materinya untuk hasil yang lebih baik.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

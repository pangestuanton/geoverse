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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <HelpCircle className="w-5 h-5 text-emerald-500" />
        Kuis Modul
      </h3>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-3">
            <p className="font-medium text-slate-700">
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
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : isWrong
                        ? "border-red-400 bg-red-50 text-red-700"
                        : isSelected
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 text-slate-600"
                    }`}
                  >
                    {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {submitted && isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {!submitted && (
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`} />
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
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {allAnswered ? "Kirim Jawaban" : `Jawab semua pertanyaan (${Object.keys(answers).length}/${questions.length})`}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl text-center ${
            score >= 80 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
          }`}
        >
          <p className="text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Skor: {score}%
          </p>
          {score >= 80 ? (
            <p className="text-sm text-emerald-600">Hebat! Kamu mendapatkan bonus 10 poin. 🎉</p>
          ) : (
            <p className="text-sm text-amber-600">Coba pelajari ulang materinya untuk hasil yang lebih baik.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

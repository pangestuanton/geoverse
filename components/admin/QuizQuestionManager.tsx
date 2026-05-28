"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Edit2, CheckCircle, AlertCircle, X } from "lucide-react";
import { quizQuestionSchema, type QuizQuestionFormData } from "@/lib/validations";
import {
  createQuizQuestion,
  updateQuizQuestion,
  softDeleteQuizQuestion,
} from "@/lib/modules";
import type { QuizQuestionDB } from "@/types";
import toast from "react-hot-toast";

interface QuizQuestionManagerProps {
  moduleId: string;
  initialQuestions: QuizQuestionDB[];
}

export default function QuizQuestionManager({ moduleId, initialQuestions }: QuizQuestionManagerProps) {
  const [questions, setQuestions] = useState<QuizQuestionDB[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (data: QuizQuestionFormData) => {
    const q = await createQuizQuestion(moduleId, {
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      points: data.points,
      sortOrder: questions.length,
    });
    setQuestions((prev) => [...prev, q]);
    setShowAddForm(false);
    toast.success("Soal berhasil ditambahkan.");
  };

  const handleUpdate = async (questionId: string, data: QuizQuestionFormData) => {
    await updateQuizQuestion(questionId, {
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      points: data.points,
    });
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, ...data, updatedAt: new Date(), version: q.version + 1 }
          : q
      )
    );
    setEditingId(null);
    toast.success("Soal berhasil diperbarui.");
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Hapus soal ini? Soal akan di-soft delete (progress user tidak terpengaruh).")) return;
    setDeletingId(questionId);
    try {
      await softDeleteQuizQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast.success("Soal berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus soal.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          Soal Kuis <span className="text-slate-400 font-normal text-sm">({questions.length} soal)</span>
        </h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-800">Soal Baru</h4>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-slate-200 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <QuizQuestionForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 && !showAddForm ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Belum ada soal kuis. Tambahkan soal pertama.</p>
        </div>
      ) : (
        questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            {editingId === q.id ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-800">Edit Soal #{idx + 1}</h4>
                  <button onClick={() => setEditingId(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <QuizQuestionForm
                  initial={q}
                  onSubmit={(data) => handleUpdate(q.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm mb-2">
                      <span className="text-emerald-600 mr-1">#{idx + 1}</span>
                      {q.question}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`text-xs px-3 py-1.5 rounded-lg ${
                            oIdx === q.correctAnswer
                              ? "bg-emerald-100 text-emerald-700 font-medium"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {oIdx === q.correctAnswer && (
                            <CheckCircle className="w-3 h-3 inline-block mr-1" />
                          )}
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-slate-400 mt-2 italic">💡 {q.explanation}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {q.points} poin
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        v{q.version}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditingId(q.id)}
                      className="p-1.5 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
                      className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                    >
                      {deletingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ===== Sub-form untuk satu soal =====
function QuizQuestionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: QuizQuestionDB;
  onSubmit: (data: QuizQuestionFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuizQuestionFormData>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      question: initial?.question || "",
      options: initial?.options?.length ? initial.options : ["", ""],
      correctAnswer: initial?.correctAnswer ?? 0,
      explanation: initial?.explanation || "",
      points: initial?.points ?? 10,
    },
  });

  // @ts-expect-error - useFieldArray string array limitation
  const optionsArr = useFieldArray({ control, name: "options" });
  const watchOptions = watch("options");

  const handleFormSubmit = async (data: QuizQuestionFormData) => {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setServerError(err.message || "Gagal menyimpan soal.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
          {serverError}
        </div>
      )}

      {/* Pertanyaan */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan *</label>
        <textarea
          {...register("question")}
          rows={2}
          placeholder="Tulis pertanyaan di sini..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
      </div>

      {/* Opsi Jawaban */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Opsi Jawaban *</label>
          {optionsArr.fields.length < 6 && (
            <button
              type="button"
              onClick={() => optionsArr.append("")}
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" /> Tambah Opsi
            </button>
          )}
        </div>
        <div className="space-y-2">
          {optionsArr.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <span className="text-xs font-bold text-slate-500 w-5 shrink-0">{String.fromCharCode(65 + idx)}.</span>
              <input
                {...register(`options.${idx}`)}
                placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {optionsArr.fields.length > 2 && (
                <button
                  type="button"
                  onClick={() => optionsArr.remove(idx)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && <p className="text-red-500 text-xs mt-1">Minimal 2 opsi jawaban.</p>}
      </div>

      {/* Jawaban Benar */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Jawaban Benar *</label>
        <select
          {...register("correctAnswer", { valueAsNumber: true })}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {(watchOptions || []).map((opt: string, idx: number) => (
            <option key={idx} value={idx}>
              {String.fromCharCode(65 + idx)}. {opt || `(Opsi ${String.fromCharCode(65 + idx)})`}
            </option>
          ))}
        </select>
        {errors.correctAnswer && <p className="text-red-500 text-xs mt-1">{errors.correctAnswer.message}</p>}
      </div>

      {/* Penjelasan */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Penjelasan Jawaban</label>
        <textarea
          {...register("explanation")}
          rows={2}
          placeholder="Jelaskan mengapa jawaban ini benar (opsional)"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        {errors.explanation && <p className="text-red-500 text-xs mt-1">{errors.explanation.message}</p>}
      </div>

      {/* Poin */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Poin</label>
        <input
          type="number"
          {...register("points", { valueAsNumber: true })}
          min={0}
          max={100}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors.points && <p className="text-red-500 text-xs mt-1">{errors.points.message}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {initial ? "Simpan" : "Tambah Soal"}
        </button>
      </div>
    </form>
  );
}

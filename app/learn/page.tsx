"use client";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import ModuleCard from "@/components/learn/ModuleCard";
import { useUserData } from "@/hooks/useUserData";
import { modules } from "@/data/modules";

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <LearnContent />
    </ProtectedRoute>
  );
}

function LearnContent() {
  const { progress } = useUserData();
  const completedIds = progress.filter((p) => p.completed).map((p) => p.moduleId);

  const categories = [
    { key: "geothermal", label: "Energi Panas Bumi Ulubelu" },
    { key: "waste", label: "Sampah dan Green Lifestyle" },
    { key: "climate", label: "Aksi Iklim" },
  ];

  return (
    <Sidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Modul Belajar
          </h1>
          <p className="text-slate-500 mt-1">
            Pelajari energi panas bumi, pemilahan sampah, dan aksi iklim melalui modul singkat.
          </p>
        </div>

        {categories.map((cat) => (
          <div key={cat.key}>
            <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {cat.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules
                .filter((m) => m.category === cat.key)
                .map((mod) => (
                  <ModuleCard key={mod.id} module={mod} isCompleted={completedIds.includes(mod.id)} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </Sidebar>
  );
}

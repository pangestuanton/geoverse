"use client";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import { challenges } from "@/data/challenges";

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesContent />
    </ProtectedRoute>
  );
}

function ChallengesContent() {
  return (
    <Sidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tantangan Aksi Iklim
          </h1>
          <p className="text-slate-500 mt-1">
            Ikuti tantangan komunitas untuk membangun kebiasaan hijau yang konsisten.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>
    </Sidebar>
  );
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { getFirebaseDB } from "./firebase";
import type { GreenLog, UserProfile, UserProgress, UserBadge } from "@/types";

// Helper to get db instance lazily
function db() {
  return getFirebaseDB();
}

// ===== USER =====

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db(), "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as UserProfile;
}

export async function updateUserPoints(uid: string, points: number) {
  const userRef = doc(db(), "users", uid);
  await updateDoc(userRef, {
    totalPoints: increment(points),
    updatedAt: serverTimestamp(),
  });
}

// ===== GREEN LOG =====

export async function addGreenLog(
  uid: string,
  logData: Omit<GreenLog, "id" | "createdAt" | "updatedAt">
) {
  // Save to user subcollection
  const userLogRef = collection(db(), "users", uid, "greenLogs");
  const docRef = await addDoc(userLogRef, {
    ...logData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Save to global collection for admin
  await addDoc(collection(db(), "greenLogs"), {
    ...logData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update user points
  await updateUserPoints(uid, logData.points);

  return docRef.id;
}

export async function getUserGreenLogs(uid: string): Promise<GreenLog[]> {
  const q = query(
    collection(db(), "users", uid, "greenLogs"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as GreenLog;
  });
}

export async function getAllGreenLogs(): Promise<GreenLog[]> {
  const q = query(collection(db(), "greenLogs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as GreenLog;
  });
}

export async function updateGreenLogStatus(
  logId: string,
  status: "pending" | "approved" | "rejected"
) {
  const logRef = doc(db(), "greenLogs", logId);
  await updateDoc(logRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ===== LEARNING PROGRESS =====

export async function saveModuleProgress(
  uid: string,
  moduleId: string,
  score: number
) {
  const progressRef = doc(db(), "users", uid, "progress", moduleId);
  await setDoc(progressRef, {
    moduleId,
    completed: true,
    score,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProgress(uid: string): Promise<UserProgress[]> {
  const snap = await getDocs(collection(db(), "users", uid, "progress"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      completedAt: data.completedAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as UserProgress;
  });
}

export async function getModuleProgress(
  uid: string,
  moduleId: string
): Promise<UserProgress | null> {
  const snap = await getDoc(doc(db(), "users", uid, "progress", moduleId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    completedAt: data.completedAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as UserProgress;
}

// ===== BADGES =====

export async function saveUserBadge(uid: string, badgeId: string) {
  const badgeRef = doc(db(), "users", uid, "badges", badgeId);
  await setDoc(badgeRef, {
    badgeId,
    unlocked: true,
    unlockedAt: serverTimestamp(),
  });
}

export async function getUserBadges(uid: string): Promise<UserBadge[]> {
  const snap = await getDocs(collection(db(), "users", uid, "badges"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      unlockedAt: data.unlockedAt?.toDate?.() || null,
    } as UserBadge;
  });
}

// ===== ADMIN =====

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db(), "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as UserProfile;
  });
}

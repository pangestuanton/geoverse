import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDB } from "./firebase";
import { createAdminNotification } from "./adminNotifications";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDB();
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Create user document if first login
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const displayName = user.displayName || "Pengguna GeoVerse";
    await setDoc(userRef, {
      uid: user.uid,
      name: displayName,
      email: user.email || "",
      photoURL: user.photoURL || "",
      totalPoints: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Picu notifikasi admin untuk pendaftaran pengguna baru
    await createAdminNotification({
      type: "new_user",
      title: "Pengguna baru bergabung",
      message: `${displayName} baru saja masuk ke GeoVerse.`,
      userId: user.uid,
      userName: displayName,
      userEmail: user.email || undefined,
      sourceCollection: "users",
      sourceId: user.uid,
    });
  }

  return user;
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const adminList = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  return adminList.includes(email.toLowerCase());
}

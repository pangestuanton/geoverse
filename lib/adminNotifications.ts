import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { getFirebaseDB } from "./firebase";

export interface CreateAdminNotificationParams {
  type: "new_user" | "new_green_log" | "new_challenge" | "new_progress" | "user_activity";
  title: string;
  message: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  sourceCollection?: string;
  sourceId?: string;
}

export async function createAdminNotification({
  type,
  title,
  message,
  userId,
  userName,
  userEmail,
  sourceCollection,
  sourceId,
}: CreateAdminNotificationParams) {
  try {
    const db = getFirebaseDB();
    let finalName = userName;
    let finalEmail = userEmail;

    // Lazily fetch user details if not provided to simplify caller side logic
    if (!finalName || !finalEmail) {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        finalName = finalName || userData.name || userData.displayName;
        finalEmail = finalEmail || userData.email;
      }
    }

    await addDoc(collection(db, "adminNotifications"), {
      type,
      title,
      message,
      userId,
      userName: finalName || "Pengguna GeoVerse",
      userEmail: finalEmail || "",
      sourceCollection: sourceCollection || "",
      sourceId: sourceId || "",
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Gagal membuat notifikasi admin:", error);
  }
}

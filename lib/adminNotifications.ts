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

export async function createAdminNotification(params: CreateAdminNotificationParams) {
  // Fitur Dinonaktifkan: No-op
  void params;
  return;
}

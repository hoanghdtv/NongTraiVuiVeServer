// src/models/PlayerContext.ts

export type PlayerContext = {
  userId: string;            // bắt buộc — identity duy nhất, từ Nakama token
  sessionId: string;         // id phiên kết nối Colyseus
  deviceId?: string;         // nếu bạn dùng device binding
  roles?: string[];          // admin, tester, etc (optional)
  // optional metadata
  ip?: string;               
  platform?: string;         // iOS / Android / Web
};

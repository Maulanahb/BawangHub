import { Timestamp } from "firebase/firestore";

export interface Thread {
  id: string;
  userId: string;
  userName: string;
  judul: string;
  isi_pesan: string;
  createdAt: Timestamp;
}

export interface Reply {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  isi_balasan: string;
  is_ai_generated: boolean;
  createdAt: Timestamp;
}

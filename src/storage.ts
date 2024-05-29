import { constants } from "buffer";
import { Memo } from "./types";
export const STORAGE_KEY = "memos";

export function readLocalStorage(key: string): Memo[] {
  const data = localStorage.getItem(key);
  if (data === null) {
    return [];
  } else {
    return JSON.parse(data);
  }
}
//ローカルストレージからデータを取得する
export function saveLocalStorage(key: string, memos: Memo[]) {
  //ローカルストレージにデータを保存する
  localStorage.setItem(key, JSON.stringify(memos));
}

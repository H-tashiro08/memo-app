import { create } from "domain";
import { Memo } from "./types";
import { readLocalStorage, saveLocalStorage, STORAGE_KEY } from "./storage";
import { marked } from "marked";

//要素一覧
const memoList = document.getElementById("List") as HTMLDivElement;
const addButon = document.getElementById("add") as HTMLButtonElement;
const editButton = document.getElementById("edit") as HTMLButtonElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const deleteButton = document.getElementById("delete") as HTMLButtonElement;
const memoTitle = document.getElementById("memoTitle") as HTMLInputElement;
const memoBody = document.getElementById("memoBaby") as HTMLTextAreaElement;
const previewBody = document.getElementById("preview") as HTMLDivElement;
const downloadLink = document.getElementById("download") as HTMLAnchorElement;

//処理

let memos: Memo[] = [];
let memoIndex: number = 0;
init();
downloadLink.addEventListener("click", clickDownloadMemo);
deleteButton.addEventListener("click", clickDeleteMemo);
addButon.addEventListener("click", clickAddMemo);
editButton.addEventListener("click", clickEditMemo);
editButton.addEventListener("click", clickSaveMemo);

//関数一覧

function newMemo(): Memo {
  const timestamp: number = Date.now();
  return {
    id: timestamp.toString() + memos.length.toString(),
    title: `newMemo ${memos.length + 1}`,
    body: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

//初期化
function init() {
  memos = readLocalStorage(STORAGE_KEY);
  console.log(memos);
  if (memos.length === 0) {
    memos.push(newMemo());
    memos.push(newMemo());
    //すべてのメモをローカルストレージに保存する
    saveLocalStorage(STORAGE_KEY, memos);
  }
  console.log(memos);
  //全てのメモのタイトルをメモ一覧に表示する
  showMemoElements(memoList, memos);
  //メモの一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
}

function newMemoElement(memo: Memo): HTMLDivElement {
  const div = document.createElement("div");
  div.innerText = memo.title;
  div.setAttribute("data-id", memo.id);
  div.classList.add("w-full", "p-sm");
  return div;
}

//すべてのメモ要素を削除する

function clearMemoElements(div: HTMLDivElement) {
  div.innerText = "";
}

function showMemoElements(div: HTMLDivElement, memos: Memo[]) {
  clearMemoElements(div);
  memos.forEach((memo) => {
    const MemoElement = newMemoElement(memo);
    div.appendChild(MemoElement);
  });
}

//div要素にアクティブスタイル設定する
function setActiveStyle(index: number, isActive: boolean) {
  const selector = `#list > div:nth-child(${index})`;
  const element = document.querySelector(selector) as HTMLDivElement;
  if (isActive) {
    element.classList.add("active");
  } else {
    element.classList.remove("active");
  }
}

function setMemoElement() {
  const memo: Memo = memos[memoIndex];
  //メモを表示する
  memoTitle.value = memo.title;
  memoBody.value = memo.body;
  //markdownで記述した本文(文字列)をHTMLにパースする
  (async () => {
    try {
      previewBody.innerHTML = await marked.parse(memo.body);
    } catch (error) {
      console.error(error);
    }
  })();
}

//イベント関連の関数一覧

function clickAddMemo(event: MouseEvent) {
  //タイトルと本文を編集モードにする
  setEditMode(true);
  //保存ボタンを表示し編集ボタンを非表示にする
  setHiddenButton(saveButton, true);
  setHiddenButton(editButton, false);
  //新しいメモを追加する
  memos.push(newMemo());
  //全てのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  //新しいメモが追加されたインデックスを設定する
  memoIndex = memos.length - 1;
  showMemoElements(memoList, memos);
  //メモの一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  setMemoElement();
}

function selectedMemo(event: MouseEvent) {
  setEditMode(false);

  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  setActiveStyle(memoIndex + 1, false);
  const target = event.target as HTMLDivElement;
  const id = target.getAttribute("data-id");
  memoIndex = memos.findIndex((memo) => memo.id === id);
  setMemoElement();
  setActiveStyle(memoIndex + 1, true);
}

function setHiddenButton(button: HTMLButtonElement, isHidden: Boolean) {
  if (isHidden) {
    button.removeAttribute("hidden");
  } else {
    button.setAttribute("hidden", "hideen");
  }
}

function setEditMode(editMode: boolean) {
  if (editMode) {
    memoTitle.removeAttribute("disabled");
    memoBody.removeAttribute("disabled");
    memoBody.removeAttribute("hidden");
    previewBody.setAttribute("hidden", "hidden");
  } else {
    memoTitle.setAttribute("disabled", "disabled");
    memoBody.setAttribute("disabled", "disabled");
    memoBody.setAttribute("hidden", "hidden");
    previewBody.setAttribute("hideen", "hidden");
  }
}

function clickEditMemo(event: MouseEvent) {
  setEditMode(true);
  setHiddenButton(saveButton, true);
  setHiddenButton(editButton, false);
}

function clickSaveMemo(event: MouseEvent) {
  const memo: Memo = memos[memoIndex];
  memo.title = memoTitle.value;
  memo.body = memoBody.value;
  memo.updatedAt = Date.now();
  saveLocalStorage(STORAGE_KEY, memos);
  setEditMode(false);
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  showMemoElements(memoList, memos);
  setActiveStyle(memoIndex + 1, true);
}

function clickDeleteMemo(event: MouseEvent) {
  if (memos.length === 1) {
    alert("これ以上削除できません");
    return;
  }
  const memoId = memos[memoIndex].id;
  memos = memos.filter((memo) => memo.id !== memoId);
  saveLocalStorage(STORAGE_KEY, memos);
  //表示するメモを出力する
  if (1 <= memoIndex) {
    memoIndex--;
  }
  //画面右側を表示モードにする
  setMemoElement();
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  //画面左側のメモのタイトル一覧をクリアして再構築する
  showMemoElements(memoList, memos);
  //表示するメモのタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
}
function clickDownloadMemo(event: MouseEvent) {
  const memo = memos[memoIndex];
  const target = event.target as HTMLAnchorElement;
  target.download = `${memo.title}.md`;
  target.href = URL.createObjectURL(
    new Blob([memo.body], {
      type: "application/octet-stream",
    })
  );
}

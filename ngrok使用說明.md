# ngrok 環境設定說明

> 本專案使用 ngrok 將本機 Server 暴露到網際網路，讓綠界金流可以將付款結果回傳到你的電腦。
> 每位組員需要完成以下步驟才能在本機測試金流功能。

---

## 第一步：註冊 ngrok 帳號

1. 開啟瀏覽器前往 [https://ngrok.com](https://ngrok.com)
2. 點選右上角 **Sign Up** 免費註冊帳號
3. 建議用 Google 帳號快速登入
4. 註冊完成後會自動進入 Dashboard（控制台）

---

## 第二步：取得你的 Auth Token

1. 登入後點選左側選單的 **Your Authtoken**
2. 複製畫面上的 Token 字串（之後會用到）

---

## 第三步：下載並安裝 ngrok

### Windows

**方法一：用 winget 安裝（推薦）**

開啟「命令提示字元」或「PowerShell」，輸入：

```bash
winget install ngrok
```

安裝完成後關閉視窗，重新開一個視窗再繼續。

**方法二：手動下載**

1. 前往 [https://ngrok.com/download](https://ngrok.com/download)
2. 選擇 **Windows** → 下載 ZIP 檔
3. 解壓縮後將 `ngrok.exe` 放到一個方便的位置，例如 `C:\ngrok\`
4. 將該資料夾路徑加入系統環境變數 PATH（或每次直接在該資料夾開命令提示字元執行）

---

## 第四步：設定 Auth Token

開啟命令提示字元，輸入（將 `你的Token` 替換成第二步複製的字串）：

```bash
ngrok config add-authtoken 你的Token
```

出現 `Authtoken saved` 表示成功，這個步驟**只需要做一次**。

---

## 第五步：啟動 ngrok

每次要測試金流功能前，先確認 Server 已經啟動，然後開啟一個新的命令提示字元輸入：

```bash
ngrok http https://localhost:7212 --scheme=https
```

啟動成功後畫面會顯示類似：

```
Forwarding   https://abcd-1234.ngrok-free.app -> https://localhost:7212
```

複製 `https://` 開頭的那串網址（每次啟動都會不同）。

---

## 第六步：設定本機環境設定檔

1. 開啟專案資料夾 `MyFitnessCoach_Server\MyFitnessCoach_Server\`
2. 在該資料夾內建立一個新檔案，命名為 `appsettings.Development.json`
3. 填入以下內容，將 ngrok 網址替換成你剛才複製的：

```json
{
  "ECPay": {
    "NgrokUrl": "https://abcd-1234.ngrok-free.app"
  }
}
```

4. 存檔

> ⚠️ **注意事項：**
> - `appsettings.Development.json` 已加入 `.gitignore`，**不會被 commit 或 push**，只存在你自己的電腦上
> - 每次重新啟動 ngrok 網址都會改變，需要重新複製網址並更新此檔案
> - 如果想要固定網址，參考下方「進階：使用固定網域」

---

## 每次開發的流程

```
1. 啟動 Visual Studio → 執行 Server 專案
2. 開命令提示字元 → 執行 ngrok http https://localhost:7212 --scheme=https
3. 複製 ngrok 網址 → 更新 appsettings.Development.json
4. 啟動前端（npm run dev）
5. 開始測試
```

---

## 進階：使用固定網域（選用）

ngrok 免費帳號提供一個**不會變動的固定網域**，設定後就不需要每次更新 `appsettings.Development.json`。

1. 登入 ngrok Dashboard
2. 點選左側 **Domains**
3. 點選 **New Domain** 建立一個固定網域
4. 之後啟動 ngrok 改用以下指令（替換成你的固定網域）：

```bash
ngrok http https://localhost:7212 --scheme=https --domain=你的固定網域.ngrok-free.app
```

5. `appsettings.Development.json` 填入這個固定網域後，之後就不需要再改了

---

## 常見問題

**Q：兩個人可以用同一個 Auth Token 嗎？**
A：可以，但同時只能有一條 tunnel 在線上。兩人同時啟動 ngrok 會互相踢掉對方。建議各自申請帳號。

**Q：ngrok 視窗關掉了怎麼辦？**
A：重新執行 `ngrok http https://localhost:7212 --scheme=https`，然後更新 `appsettings.Development.json` 的網址。

**Q：啟動 ngrok 後出現 `command not found`？**
A：表示 ngrok 沒有加入環境變數，請切換到 ngrok.exe 所在資料夾後再執行，或重新用 winget 安裝。

**Q：appsettings.Development.json 要放在哪裡？**
A：放在 `MyFitnessCoach_Server\MyFitnessCoach_Server\` 資料夾內，和 `appsettings.json` 同一層。

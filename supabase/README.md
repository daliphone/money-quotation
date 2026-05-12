# Supabase 設定指南

本專案使用 Supabase 作為後端資料庫。

## 手動設定步驟

### 1. 建立 Supabase 專案
- 前往 [supabase.com](https://supabase.com)
- 建立新專案（或使用現有專案）
- 記下專案 URL 和 API Key（anon key）

### 2. 配置環境變數
將以下內容加入 `.env.local`：
```
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. 執行資料庫遷移

#### 遷移 1: 初始化架構
1. 在 Supabase Dashboard 中進入 **SQL Editor**
2. 複製 `migrations/001_initial_schema.sql` 的全部內容
3. 貼入 SQL Editor 並執行

#### 遷移 2: 啟用 RLS 策略
1. 複製 `migrations/002_rls_policies.sql` 的全部內容
2. 貼入 SQL Editor 並執行

### 4. 建立管理員帳戶
1. 在 Supabase Dashboard **Authentication** 頁面中，點擊 "Create a new user"
2. 輸入電子郵件和密碼，建立第一個使用者
3. 在 Dashboard **SQL Editor** 中執行以下 SQL 將其設定為管理員：
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';
```
（將 `<user-id>` 替換為上一步建立的使用者 UUID）

## 架構概覽

- **profiles**: 使用者資料表（name, role）
- **products**: 產品清單（名稱、規格、現金價、刷卡價）
- **quotations**: 報價單主表（編號、客戶資訊、日期、狀態）
- **quotation_items**: 報價單明細（商品、數量、單價）

所有表格均啟用 Row Level Security (RLS) 進行訪問控制。

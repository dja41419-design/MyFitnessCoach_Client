# form.newPassword 與 const rules 的關聯說明

## 概覽

`form.newPassword` 是使用者輸入的新密碼值，`const rules` 是根據這個值即時計算的驗證規則結果。兩者透過 Vue 的 `computed` 響應式機制串聯，`form.newPassword` 一變動，`rules` 立刻重新計算。

---

## 資料定義

### form.newPassword

```ts
// ResetPwd.vue — script setup
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
```

- `form` 是一個 `reactive` 物件
- `newPassword` 初始值為空字串 `''`
- 透過 `v-model="form.newPassword"` 綁定到 template 的輸入框，使用者打字時同步更新

```html
<!-- ResetPwd.vue — template -->
<input
  id="newPassword"
  v-model="form.newPassword"
  :type="show.new ? 'text' : 'password'"
  ...
/>
```

---

### const rules

```ts
// ResetPwd.vue — script setup
const rules = computed(() => {
  const p = form.newPassword   // ← 直接讀取 form.newPassword
  return {
    minLen:    p.length >= 8,           // 至少 8 個字元
    hasUpper:  /[A-Z]/.test(p),         // 包含大寫字母
    hasNumber: /[0-9]/.test(p),         // 包含數字
    hasSymbol: /[^A-Za-z0-9]/.test(p),  // 包含特殊字元
  }
})
```

- `rules` 是一個 `computed`，回傳物件，每個 key 對應一條規則的 `true` / `false`
- 內部直接將 `form.newPassword` 賦給 `p`，對它做規則判斷
- 因為讀取了 `form.newPassword`（reactive），Vue 自動追蹤依賴，**密碼輸入框每次改變，`rules` 都會重新執行**

---

## 響應式流程

```
使用者輸入密碼
      │
      ▼
form.newPassword 更新（v-model 雙向綁定）
      │
      ▼
const rules (computed) 自動重新計算
      │
      ├── minLen:    p.length >= 8
      ├── hasUpper:  /[A-Z]/.test(p)
      ├── hasNumber: /[0-9]/.test(p)
      └── hasSymbol: /[^A-Za-z0-9]/.test(p)
      │
      ▼
template 中的規則清單即時更新顯示
```

---

## template 中的使用

### v-if 控制顯示時機

```html
<div v-if="form.newPassword" class="pwd-feedback">
  ...規則清單與強度條...
</div>
```

- 只有當 `form.newPassword` 不為空字串時，才渲染整塊規則提示區域
- `form.newPassword` 為空（使用者尚未輸入）時，完全不顯示

### 規則清單綁定

```html
<ul class="pwd-rules">
  <li :class="rules.minLen    ? 'rule-pass' : 'rule-fail'">
    {{ rules.minLen    ? '✓' : '✗' }} 至少 8 個字元
  </li>
  <li :class="rules.hasUpper  ? 'rule-pass' : 'rule-fail'">
    {{ rules.hasUpper  ? '✓' : '✗' }} 包含大寫字母
  </li>
  <li :class="rules.hasNumber ? 'rule-pass' : 'rule-fail'">
    {{ rules.hasNumber ? '✓' : '✗' }} 包含數字
  </li>
  <li :class="rules.hasSymbol ? 'rule-pass' : 'rule-fail'">
    {{ rules.hasSymbol ? '✓' : '✗' }} 包含特殊字元
  </li>
</ul>
```

- 每個 `<li>` 根據對應的 `rules.*` 值切換 CSS class
  - `rule-pass`：綠色，顯示 ✓
  - `rule-fail`：灰色，顯示 ✗

---

## 強度計算（const strength）

`rules` 的結果也被另一個 computed `strength` 消費，計算密碼強度等級：

```ts
const strength = computed((): number => {
  if (!form.newPassword) return 0
  const passed = Object.values(rules.value).filter(Boolean).length
  // passed = 通過幾條規則（0～4）
  if (passed <= 1) return 1  // 弱
  if (passed <= 3) return 2  // 中等
  return 3                   // 強
})
```

- `Object.values(rules.value)` 取出四條規則的布林值陣列
- `.filter(Boolean).length` 算出通過幾條
- 依通過數量回傳 1（弱）/ 2（中等）/ 3（強）

---

## 注意事項

目前 `rules` 只用於**即時提示**，送出表單時的 `validate()` 函式**只檢查長度 >= 8**，並不要求大寫字母、數字、特殊字元全部通過：

```ts
function validate(): boolean {
  // ...
  if (!form.newPassword) {
    errors.newPassword = '請輸入新密碼'
  } else if (form.newPassword.length < 8) {
    errors.newPassword = '密碼至少需要 8 個字元'
  } else if (form.newPassword === form.oldPassword) {
    errors.newPassword = '新密碼不可與舊密碼相同'
  } else {
    errors.newPassword = ''
  }
  // ...
}
```

若要在送出時也強制所有規則通過，可在 `validate()` 中加入：

```ts
} else if (!Object.values(rules.value).every(Boolean)) {
  errors.newPassword = '密碼需包含大寫字母、數字及特殊字元'
}
```

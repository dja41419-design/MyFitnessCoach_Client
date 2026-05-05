<template>
  <div class="register-form-container">
    <div v-if="showLogo" class="register-logo">
      <img src="/assets/logo.png" alt="My Fitness Coach" class="register-logo-img" />
      <span class="register-logo-name">MyFitnessCoach</span>
    </div>

    <h1 class="register-title">{{ title }}</h1>
    <p class="register-subtitle">{{ subtitle }}</p>

    <div v-if="successEmail" class="form-success-banner">
      <svg class="success-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
        <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>註冊成功，啟用信已寄送至 <strong>{{ successEmail }}</strong>，請完成信箱驗證後登入。</span>
    </div>

    <form v-else class="register-form" @submit.prevent="handleSubmit" novalidate>
      <div class="form-group">
        <label for="name" class="form-label">姓名</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'is-error': errors.name }"
          placeholder="請輸入姓名"
          autocomplete="name"
          maxlength="50"
          @blur="onBlur('name')"
          @input="onInput('name')"
        />
        <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="account" class="form-label">帳號</label>
        <input
          id="account"
          v-model="form.account"
          type="text"
          class="form-input"
          :class="{ 'is-error': errors.account }"
          placeholder="4-20 位英文或數字"
          autocomplete="username"
          maxlength="20"
          @blur="onBlur('account')"
          @input="onInput('account')"
        />
        <span v-if="errors.account" class="form-error">{{ errors.account }}</span>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">密碼</label>
        <div class="input-wrap">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'is-error': errors.password }"
            placeholder="8-12 位，含大寫、數字與符號"
            autocomplete="new-password"
            maxlength="12"
            @blur="onBlur('password')"
            @input="onInput('password')"
          />
          <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'">
            <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <div v-if="form.password" class="pwd-feedback">
          <ul class="pwd-rules">
            <li :class="rules.minLen && rules.maxLen ? 'rule-pass' : 'rule-fail'">
              {{ rules.minLen && rules.maxLen ? '通過' : '未通過' }} 長度 8-12 位
            </li>
            <li :class="rules.hasUpper ? 'rule-pass' : 'rule-fail'">
              {{ rules.hasUpper ? '通過' : '未通過' }} 至少一個大寫英文字母
            </li>
            <li :class="rules.hasNumber ? 'rule-pass' : 'rule-fail'">
              {{ rules.hasNumber ? '通過' : '未通過' }} 至少一個數字
            </li>
            <li :class="rules.hasSymbol ? 'rule-pass' : 'rule-fail'">
              {{ rules.hasSymbol ? '通過' : '未通過' }} 至少一個符號
            </li>
            <li :class="rules.noKeyboardSeq ? 'rule-pass' : 'rule-fail'">
              {{ rules.noKeyboardSeq ? '通過' : '未通過' }} 不可包含連續鍵盤序列
            </li>
          </ul>
          <div class="strength-row">
            <div class="strength-bar-wrap" aria-hidden="true">
              <span class="strength-segment" :class="{ active: strength >= 1, weak: strength === 1, medium: strength === 2, strong: strength === 3 }"></span>
              <span class="strength-segment" :class="{ active: strength >= 2, medium: strength === 2, strong: strength === 3 }"></span>
              <span class="strength-segment" :class="{ active: strength >= 3, strong: strength === 3 }"></span>
            </div>
            <span class="strength-label" :class="strengthClass">{{ strengthText }}</span>
          </div>
        </div>
        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword" class="form-label">確認密碼</label>
        <div class="input-wrap">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'is-error': errors.confirmPassword }"
            placeholder="請再次輸入密碼"
            autocomplete="new-password"
            maxlength="12"
            @blur="onBlur('confirmPassword')"
            @input="onInput('confirmPassword')"
          />
          <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword" :aria-label="showConfirmPassword ? '隱藏密碼' : '顯示密碼'">
            <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
      </div>

      <div class="form-group">
        <label for="email" class="form-label">電子信箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'is-error': errors.email }"
          placeholder="請輸入電子信箱"
          autocomplete="email"
          maxlength="100"
          @blur="onBlur('email')"
          @input="onInput('email')"
        />
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="phone" class="form-label">手機</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="form-input"
          :class="{ 'is-error': errors.phone }"
          placeholder="09xxxxxxxx"
          autocomplete="tel"
          maxlength="10"
          @blur="onBlur('phone')"
          @input="onInput('phone')"
        />
        <span v-if="errors.phone" class="form-error">{{ errors.phone }}</span>
      </div>

      <div class="form-group">
        <span class="form-label">性別</span>
        <div class="gender-row">
          <label class="gender-option" :class="{ selected: form.gender === 'M', 'is-error': errors.gender }">
            <input type="radio" name="gender" value="M" v-model="form.gender" @change="onInput('gender')" />
            男
          </label>
          <label class="gender-option" :class="{ selected: form.gender === 'F', 'is-error': errors.gender }">
            <input type="radio" name="gender" value="F" v-model="form.gender" @change="onInput('gender')" />
            女
          </label>
        </div>
        <span v-if="errors.gender" class="form-error">{{ errors.gender }}</span>
      </div>

      <div class="form-group">
        <label for="dateOfBirth" class="form-label">生日</label>
        <input
          id="dateOfBirth"
          v-model="form.dateOfBirth"
          type="date"
          class="form-input"
          :class="{ 'is-error': errors.dateOfBirth }"
          :max="maxBirthDate"
          :min="minBirthDate"
          @blur="onBlur('dateOfBirth')"
          @input="onInput('dateOfBirth')"
        />
        <span v-if="errors.dateOfBirth" class="form-error">{{ errors.dateOfBirth }}</span>
      </div>

      <div v-if="apiError" class="form-api-error">{{ apiError }}</div>

      <div class="btn-row">
        <button type="button" class="clear-btn" @click="handleClear">清除</button>
        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
          {{ isLoading ? '註冊中...' : '註冊' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRef } from 'vue'
import { register } from '@/data/register'
import { usePasswordQuality } from '@/composables/usePasswordQuality'
import {
  ACCOUNT_REGEX,
  EMAIL_REGEX,
  MOBILE_REGEX,
  NAME_MAX_LENGTH,
  hasHtmlSpecialChar,
} from '@/utils/validators'

defineProps({
  title: { type: String, default: '建立帳號' },
  subtitle: { type: String, default: '加入 MyFitnessCoach，開始管理你的健康目標' },
  showLogo: { type: Boolean, default: true },
})

const emit = defineEmits<{
  success: [email: string]
}>()

const form = reactive({
  name: '',
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  gender: '' as 'M' | 'F' | '',
  dateOfBirth: '',
})

const errors = reactive({
  name: '',
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
})

const touched = reactive({
  name: false,
  account: false,
  password: false,
  confirmPassword: false,
  email: false,
  phone: false,
  gender: false,
  dateOfBirth: false,
})

const { rules, strength, strengthText, strengthClass, isValid: isPasswordValid, firstFailureMessage: passwordFailureMessage } = usePasswordQuality(toRef(form, 'password'))

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const apiError = ref('')
const isLoading = ref(false)
const successEmail = ref('')

const today = new Date()
const maxBirthDate = computed(() => toDateInputValue(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())))
const minBirthDate = computed(() => toDateInputValue(new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())))

function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

function validateOne(field: keyof typeof errors): string {
  switch (field) {
    case 'name': {
      const name = form.name.trim()
      if (!name) return '請輸入姓名'
      if (name.length > NAME_MAX_LENGTH) return `姓名不可超過 ${NAME_MAX_LENGTH} 字`
      if (hasHtmlSpecialChar(name)) return '姓名不可包含特殊 HTML 字元'
      return ''
    }
    case 'account':
      return form.account.trim()
        ? ACCOUNT_REGEX.test(form.account.trim()) ? '' : '帳號需為 4-20 位英文或數字'
        : '請輸入帳號'
    case 'password':
      return form.password
        ? isPasswordValid.value ? '' : passwordFailureMessage.value
        : '請輸入密碼'
    case 'confirmPassword':
      return form.confirmPassword
        ? form.confirmPassword === form.password ? '' : '兩次輸入的密碼不一致'
        : '請再次輸入密碼'
    case 'email':
      return form.email.trim()
        ? EMAIL_REGEX.test(form.email.trim()) ? '' : '請輸入正確的電子信箱'
        : '請輸入電子信箱'
    case 'phone':
      return form.phone.trim()
        ? MOBILE_REGEX.test(form.phone.trim()) ? '' : '請輸入正確的手機號碼'
        : '請輸入手機號碼'
    case 'gender':
      return form.gender ? '' : '請選擇性別'
    case 'dateOfBirth': {
      if (!form.dateOfBirth) return '請選擇生日'
      const dob = new Date(form.dateOfBirth)
      if (dob > new Date(maxBirthDate.value)) return '註冊年齡需滿 10 歲'
      if (dob < new Date(minBirthDate.value)) return '請輸入正確的生日'
      return ''
    }
  }
}

function onBlur(field: keyof typeof errors) {
  touched[field] = true
  errors[field] = validateOne(field)
}

function onInput(field: keyof typeof errors) {
  touched[field] = true
  errors[field] = validateOne(field)
  if (field === 'password' && touched.confirmPassword) {
    errors.confirmPassword = validateOne('confirmPassword')
  }
}

function validate(): boolean {
  const fields = Object.keys(errors) as (keyof typeof errors)[]
  fields.forEach((field) => {
    touched[field] = true
    errors[field] = validateOne(field)
  })
  return fields.every((field) => !errors[field])
}

function handleClear() {
  Object.assign(form, {
    name: '',
    account: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  })
  Object.keys(errors).forEach((field) => {
    errors[field as keyof typeof errors] = ''
    touched[field as keyof typeof touched] = false
  })
  apiError.value = ''
}

async function handleSubmit() {
  apiError.value = ''
  if (!validate()) return

  isLoading.value = true
  try {
    await register({
      userName: form.name.trim(),
      account: form.account.trim(),
      password: form.password,
      email: form.email.trim(),
      mobile: form.phone.trim(),
      gender: form.gender as 'M' | 'F',
      dateOfBirth: form.dateOfBirth,
    })
    successEmail.value = form.email.trim()
    emit('success', successEmail.value)
  } catch (err) {
    apiError.value = err instanceof Error ? err.message : '註冊失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form-container {
  width: 100%;
}

.register-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.register-logo-img {
  height: 60px;
  object-fit: contain;
}

.register-logo-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.register-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 8px;
}

.register-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 24px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap .form-input {
  flex: 1;
  padding-right: 44px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--text-primary);
}

.eye-btn svg {
  width: 18px;
  height: 18px;
}

.form-input {
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.form-input:focus {
  border-color: var(--accent);
}

.form-input.is-error {
  border-color: #c0392b;
}

.form-error {
  font-size: 0.78rem;
  color: #c0392b;
}

.pwd-feedback {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pwd-rules {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  margin: 0;
}

.pwd-rules li {
  font-size: 0.78rem;
  transition: color 0.2s;
}

.rule-pass {
  color: #27ae60;
  font-weight: 600;
}

.rule-fail {
  color: var(--text-secondary);
}

.strength-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar-wrap {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.strength-segment {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  transition: background 0.3s;
}

.strength-segment.active.weak {
  background: #c0392b;
}

.strength-segment.active.medium {
  background: #e67e22;
}

.strength-segment.active.strong {
  background: #27ae60;
}

.strength-label {
  font-size: 0.78rem;
  font-weight: 600;
}

.text-weak {
  color: #c0392b;
}

.text-medium {
  color: #e67e22;
}

.text-strong {
  color: #27ae60;
}

.gender-row {
  display: flex;
  gap: 12px;
}

.gender-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.gender-option input[type="radio"] {
  accent-color: var(--accent-dark);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.gender-option.selected {
  border-color: var(--accent-dark);
  background: #fdf8f3;
  color: var(--text-primary);
  font-weight: 600;
}

.gender-option.is-error {
  border-color: #c0392b;
}

.form-api-error {
  padding: 12px 16px;
  border-radius: var(--radius);
  background: #fdf0ee;
  border: 1px solid #e8b4ae;
  color: #c0392b;
  font-size: 0.85rem;
  text-align: center;
}

.form-success-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border-radius: var(--radius);
  background: #f0f9f4;
  border: 1px solid #a8d5b8;
  color: #1e6b3e;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.success-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #1e6b3e;
}

.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.clear-btn {
  flex: 1;
  padding: 14px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.submit-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 100px;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #2d2620;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(26, 22, 19, 0.15);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(245, 240, 235, 0.4);
  border-top-color: var(--text-light);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

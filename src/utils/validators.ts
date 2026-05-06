/**
 * 共用欄位驗證工具
 * - 集中 XSS 防護、鍵盤序列、共用 regex
 * - 前後端行為需保持一致，後端對應 PasswordSequenceChecker.cs
 */

export const HTML_SPECIAL_CHAR_REGEX = /[<>"'&/\\`]/

const KEYBOARD_SEQUENCES = [
  'asdfghjkl',
  'qwertyuiop',
  'zxcvbnm',
  '1234567890',
  'abcdefghijklmnopqrstuvwxyz',
]

export function hasKeyboardSequence(password: string, threshold = 6): boolean {
  if (!password || password.length < threshold) return false
  const lower = password.toLowerCase()
  for (const seq of KEYBOARD_SEQUENCES) {
    const reversed = [...seq].reverse().join('')
    for (const s of [seq, reversed]) {
      for (let i = 0; i + threshold <= s.length; i++) {
        if (lower.includes(s.slice(i, i + threshold))) return true
      }
    }
  }
  return false
}

export function hasHtmlSpecialChar(text: string): boolean {
  return HTML_SPECIAL_CHAR_REGEX.test(text)
}

export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
export const MOBILE_REGEX = /^09\d{8}$/
export const ACCOUNT_REGEX = /^[A-Za-z0-9]{4,20}$/

export const NAME_MAX_LENGTH = 50
export const ACCOUNT_MAX_LENGTH = 20
export const EMAIL_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 12

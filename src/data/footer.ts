// Footer 連結欄位資料

export interface FooterLink {
  label: string
  href: string
}

export interface FooterCol {
  title: string
  links: FooterLink[]
}

export const footerCols: FooterCol[] = [
  {
    title: '服務',
    links: [
      { label: '營養師諮詢', href: '#nutritionists' },
      { label: '課程套組',   href: '#pricing' },
      { label: '飲食追蹤',   href: '#tracking' },
      { label: '健康商城',   href: '#shop' },
    ],
  },
  {
    title: '關於我們',
    links: [
      { label: '品牌故事',   href: '#' },
      { label: '營養師招募', href: '#' },
      { label: '常見問題',   href: '#' },
      { label: '隱私政策',   href: '#' },
    ],
  },
  {
    title: '聯繫方式',
    links: [
      { label: 'contact@myfitcoach.tw', href: 'mailto:contact@myfitcoach.tw' },
      { label: '+886 2-1234-5678',      href: 'tel:+886212345678' },
      { label: 'Instagram',             href: '#' },
      { label: 'Facebook',              href: '#' },
    ],
  },
]

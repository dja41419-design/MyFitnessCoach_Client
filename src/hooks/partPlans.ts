import { reactive } from "vue"


export default function () {
    // data
    let pricingPlans = reactive([
        {
            name: '單次體驗', label: '適合初次嘗試',
            price: 'NT$800', unit: '次', period: '單次線上刷卡付款',
            features: ['1 小時一對一諮詢', '自選營養師與時段', '基礎飲食建議報告', '線上刷卡支付'],
            btnStyle: 'light', btnText: '立即預約', featured: false, badge: null,
        },
        {
            name: '經典套組', label: '最多人選擇的方案',
            price: 'NT$3,600', unit: '組', period: '含 5 次諮詢點數（每次省 $80）',
            features: ['5 堂一對一諮詢點數', '完整飲食追蹤功能', 'BMR / TDEE 智慧分析', '個人體態報表', '商城 9 折優惠'],
            btnStyle: 'accent', btnText: '立即購買', featured: true, badge: '最受歡迎',
        },
        {
            name: '進階方案', label: '深度體態管理',
            price: 'NT$6,800', unit: '組', period: '含 10 次諮詢點數（每次省 $120）',
            features: ['10 堂一對一諮詢點數', '優先預約熱門營養師', '進階數據整合分析', '每月體態追蹤報告', '商城 85 折優惠'],
            btnStyle: 'light', btnText: '立即購買', featured: false, badge: null,
        },
    ])

    return { pricingPlans }
}
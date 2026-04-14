import { reactive, ref } from "vue"


export default function () {
    // data
    const shopTabs = reactive(['全部', '蛋白質', '輕食', '補給品', '零食'])
    const activeTab = ref('全部')

    const shopProducts = reactive([
        {
            name: '舒肥即食雞胸肉（5入）', category: '蛋白質',
            img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
            price: 'NT$399', original: 'NT$499', badge: '熱銷',
        },
        {
            name: '分離乳清蛋白粉 1kg', category: '補給品',
            img: 'https://images.unsplash.com/photo-1622484211148-3e0ab498b7d6?w=400&h=300&fit=crop',
            price: 'NT$1,280', original: null, badge: null,
        },
        {
            name: '低卡鮮蔬沙拉組合', category: '輕食',
            img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
            price: 'NT$199', original: null, badge: '新品',
        },
        {
            name: '無調味綜合堅果 300g', category: '零食',
            img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop',
            price: 'NT$320', original: 'NT$380', badge: null,
        },
    ])

    return { shopTabs, activeTab, shopProducts }
}
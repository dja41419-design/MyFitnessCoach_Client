import { reactive, ref } from "vue"


export default function () {
    // data
    const Instructors = reactive([
        {
            name: '蘇怡婷 營養師', specialty: '體重管理專家',
            img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&crop=face',
            bio: '擁有 8 年臨床經驗，專精於體重控制與代謝調理。曾輔導超過 500 位學員成功達標，擅長為外食族設計實際可執行的飲食方案。',
            tags: ['體重控制', '代謝調理', '外食規劃'],
        },
        {
            name: '陳宥翔 營養師', specialty: '運動營養顧問',
            img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=500&fit=crop&crop=face',
            bio: '前職業運動員背景，深諳運動營養學。專為健身族群、運動選手量身打造增肌減脂飲食策略，精確計算巨量營養素比例。',
            tags: ['增肌減脂', '運動營養', '巨量營養素'],
        },
        {
            name: '張雅芯 營養師', specialty: '孕期與產後調理',
            img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=face',
            bio: '專注於孕期營養規劃與產後體態恢復，溫柔細膩的諮詢風格深受媽媽族群信賴。同時也擅長兒童飲食營養指導。',
            tags: ['孕期營養', '產後恢復', '兒童飲食'],
        },
        {
            name: '林柏勳 營養師', specialty: '慢性疾病飲食',
            img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&h=500&fit=crop&crop=face',
            bio: '擁有醫學中心 10 年臨床經驗，專精於三高、糖尿病等慢性疾病的飲食管理與衛教，幫助你吃出健康新生活。',
            tags: ['三高飲食', '糖尿病', '慢性病管理'],
        },
    ])

    // function
    // === 輪播相關狀態 ===
    const nutriTrackRef = ref<HTMLElement | null>(null)
    // 因為 nutriIndex 只是用來計算偏移量，沒有要在 HTML 上顯示，所以維持 let 即可；
    // 如果未來會需要在畫面上顯示「目前是第幾頁」，再改成 ref(0)
    let nutriIndex = 0

    // === Functions ===
    function slideNutri(dir: number) {
        const track = nutriTrackRef.value
        if (!track) return
        const cards = track.querySelectorAll<HTMLElement>('.nutri-card')
        if (!cards.length) return

        const parent = track.parentElement
        if (!parent) return
        
        const cardWidth = cards[0].offsetWidth + 20  // 卡片寬度 + gap
        const maxIndex = Math.max(0, cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth))

        nutriIndex = Math.max(0, Math.min(nutriIndex + dir, maxIndex))
        track.style.transform = `translateX(-${nutriIndex * cardWidth}px)`
    }

    // 將需要用到的變數與函式回傳
    return { 
        Instructors, 
        nutriTrackRef, 
        slideNutri 
    }
}
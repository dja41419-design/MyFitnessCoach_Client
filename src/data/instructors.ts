// 營養師資料
// 改成透過 fetch API 從後端獲取

export interface Instructor {
  id: number
  name: string
  specialty: string
  img: string
  bio: string
  tags: string[]
  rating: number
}

export interface Availability {
  shiftId: number
  date: string
  timeSlot: string
  isReserved: boolean
}

/**
 * 取得營養師圖片路徑
 * @param instructorId 營養師 ID
 * @returns 圖片 URL
 */
export const getInstructorImagePath = (instructorId: number): string => {
  if (instructorId === -1) {
    return "/assets/noImg.png";
  }
  // 指向後端 API 的圖片獲取路徑
  return `/api/Instructor/Image/${instructorId}`;
}

export const fetchAllInstructors = async (name: string = '', year?: number, month?: number): Promise<Instructor[]> => {
  try {
    let url = `/api/Instructor?name=${name}`;
    if (year) url += `&year=${year}`;
    if (month !== undefined) url += `&month=${month}`;

    const response = await fetch(url)
    if (!response.ok) throw new Error('無法獲取營養師資料')
    const data = await response.json()
    
    return data.map((i: any) => ({
      id: i.id,
      name: i.userName,
      specialty: i.title,
      // 使用 getInstructorImagePath 獲取圖片路徑
      img: getInstructorImagePath(i.id),
      bio: i.description,
      tags: [],
      rating: i.averageRating || 0
    }))
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return []
  }
}

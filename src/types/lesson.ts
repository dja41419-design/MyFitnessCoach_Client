export interface LessonPlan {
  id: number;
  planName: string;
  price: number;
  points: number;
  description: string;
  imageUrl?: string | null;
}

export interface CartItem extends LessonPlan {
  // Currently CartItem is the same as LessonPlan, 
  // but we can add more properties here if needed (e.g., quantity)
}

export interface EcPayParameters {
  [key: string]: string;
}

export interface EcPayResponse {
  action: string;
  parameters: EcPayParameters;
}

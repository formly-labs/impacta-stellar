export interface FieldInput {
  type: 'text' | 'email' | 'phone' | 'number' | 'radio' | 'checkbox' | 'short_text' | 'long_text';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  allowOther?: boolean;
}

export interface FormCreateInput {
  title: string;
  description?: string;
  ownerAddress: string;
  fields: FieldInput[];
  theme?: string;
  rewardPerGoodAnswer?: number;
}

export interface FormUpdateInput {
  title?: string;
  description?: string;
  fields?: FieldInput[];
  isActive?: boolean;
  theme?: string;
  rewardPerGoodAnswer?: number;
}

export interface FormResponse extends FormCreateInput {
  id: string;
  createdAt: string;
  isActive: boolean;
  budget: number;
}

export interface FieldInput {
  type: 'text' | 'email' | 'phone' | 'number';
  label: string;
  placeholder: string;
  required: boolean;
}

export interface FormCreateInput {
  title: string;
  description: string;
  ownerAddress: string;
  fields: FieldInput[];
}

export interface FormUpdateInput {
  title?: string;
  description?: string;
  fields?: FieldInput[];
  isActive?: boolean;
}

export interface FormResponse extends FormCreateInput {
  id: string;
  createdAt: string;
  isActive: boolean;
}

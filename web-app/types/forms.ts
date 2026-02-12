// ============== Workspace Types ==============

export type LinkAccess = 'RESTRICTED' | 'ANYONE_WITH_LINK';
export type Permission = 'VIEWER' | 'EDITOR';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  walletAddress: string;
  permission: Permission;
  createdAt: string;
}

export interface WorkspaceCreateInput {
  name: string;
  description?: string;
  ownerAddress: string;
  linkAccess?: LinkAccess;
  linkPermission?: Permission;
}

export interface WorkspaceUpdateInput {
  name?: string;
  description?: string;
  linkAccess?: LinkAccess;
  linkPermission?: Permission;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string;
  ownerAddress: string;
  linkAccess: LinkAccess;
  linkPermission: Permission;
  members?: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface AddMemberInput {
  walletAddress: string;
  permission: Permission;
}

// ============== Form Types ==============

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
  workspaceId?: string;
}

export interface FormUpdateInput {
  title?: string;
  description?: string;
  fields?: FieldInput[];
  isActive?: boolean;
  theme?: string;
  rewardPerGoodAnswer?: number;
  workspaceId?: string;
  slug: string,
}

export interface FormResponse extends FormCreateInput {
  id: string;
  createdAt: string;
  isActive: boolean;
  isArchived: boolean;
  budget: number;
  slug: string,
}

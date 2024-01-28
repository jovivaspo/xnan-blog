export interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
  CHIEFEDITOR = 'chiefeditor',
}

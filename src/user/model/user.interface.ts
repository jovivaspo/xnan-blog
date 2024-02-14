export interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImage?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
  CHIEFEDITOR = 'chiefeditor',
}

export interface File {
  profileImage: string;
}

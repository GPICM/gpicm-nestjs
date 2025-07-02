export interface UserBasicData {
  name: string | null;

  bio: string | null;

  profilePicture?: string | null;

  email?: string | null;

  gender?: string | null;

  birthDate?: Date | null;

  phoneNumber?: string | null;

  createdAt: Date;

  updatedAt: Date | null;
}

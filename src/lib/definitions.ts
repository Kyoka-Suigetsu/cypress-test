import type { UserRoom } from "@prisma/client";

export interface OwnedBy {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  password: string;
  image: string | null;
  role: string;
  organizationId: string | null;
}

export interface Room {
  description: string;
  id: string;
  name: string;
  ownedBy: OwnedBy;
  userRooms: Array<UserRoom>;
}

export type Rooms = Array<Room>;


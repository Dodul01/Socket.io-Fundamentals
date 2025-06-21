export interface IRoomAccess {
  roomId: string;
  userId: string;
  isAdmin: boolean;
  createdAt?: Date;
}

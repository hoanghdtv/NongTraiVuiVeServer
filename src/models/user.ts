export interface UserDTO {
  id: string;
  name: string;
  coins: number;
  version?: number; // for optimistic locking
}
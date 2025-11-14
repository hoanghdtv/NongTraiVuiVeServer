import { UserDTO } from "../../models/user";


export interface IUserRepo {
  findOne(id: string): Promise<UserDTO | null>;
  save(user: UserDTO): Promise<UserDTO>;
  update(id: string, patch: Partial<UserDTO>): Promise<UserDTO>;
  remove(id: string): Promise<void>;
}

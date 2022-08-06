export class UserLogin<T = any> {
  UserLoginID?: number;
  Token: string | undefined;
  RefreshToken: string | undefined;
  User?: T;
}

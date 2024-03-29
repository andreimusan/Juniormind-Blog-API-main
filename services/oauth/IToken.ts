export default interface IToken {
  username: string;
  email: string;
  userId: number;
  userImage: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

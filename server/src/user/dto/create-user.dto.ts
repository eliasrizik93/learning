export class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  birthday?: Date;
  profile?: string;
  country?: string;
  phoneNumber?: string;
  profileVisible?: boolean;
}

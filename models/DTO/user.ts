export default class User {
  id: number;

  name: string;

  email: string;

  password: string;

  active: boolean;

  isAdmin: boolean;

  image: string;

  dateCreated?: Date;

  dateModified?: Date;

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    isAdmin: boolean,
    dateCreated?: Date,
    dateModified?: Date,
    active: boolean = true,
    image = ""
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.dateCreated = dateCreated;
    this.dateModified = dateModified;
    this.active = active;
    this.isAdmin = isAdmin;
    this.image = image;
  }
}

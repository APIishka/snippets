class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  greet() {
    return `Hello, I'm ${this.name}`;
  }

  get age() {
    return new Date().getFullYear() - this.createdAt.getFullYear();
  }

  static createGuest() {
    return new User('Guest', 'guest@example.com');
  }
}

const user = new User('John', 'john@example.com');
console.log(user.greet());

const guest = User.createGuest();
console.log(guest.name);

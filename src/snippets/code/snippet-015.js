class User {
  constructor(type, permissions) {
    this.type = type;
    this.permissions = permissions;
  }
}

class UserFactory {
  static createUser(type) {
    switch (type) {
      case 'admin':
        return new User('admin', ['read', 'write', 'delete']);
      case 'moderator':
        return new User('moderator', ['read', 'write']);
      case 'guest':
        return new User('guest', ['read']);
      default:
        throw new Error(`Unknown user type: ${type}`);
    }
  }
}

const admin = UserFactory.createUser('admin');
const guest = UserFactory.createUser('guest');

console.log(admin);
console.log(guest);

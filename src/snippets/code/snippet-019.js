const user = {
  name: 'John',
  email: 'john@example.com',
  password: 'secret123'
};

const userProxy = new Proxy(user, {
  get(target, property) {
    if (property === 'password') {
      console.log('Access denied: password is private');
      return undefined;
    }
    console.log(`Reading ${property}:`, target[property]);
    return target[property];
  },
  
  set(target, property, value) {
    if (property === 'email' && !value.includes('@')) {
      throw new Error('Invalid email format');
    }
    console.log(`Setting ${property} to:`, value);
    target[property] = value;
    return true;
  }
});

console.log(userProxy.name);
console.log(userProxy.password);
userProxy.email = 'newemail@example.com';

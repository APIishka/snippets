const users = [
  { name: 'Alice', age: 28, active: true },
  { name: 'Bob', age: 35, active: false },
  { name: 'Charlie', age: 22, active: true }
];

const activeUsers = users.filter(user => user.active);

const userNames = users.map(user => user.name);

const totalAge = users.reduce((sum, user) => sum + user.age, 0);
const averageAge = totalAge / users.length;

const youngUser = users.find(user => user.age < 25);

const hasInactiveUsers = users.some(user => !user.active);

const allAdults = users.every(user => user.age >= 18);

console.log({ activeUsers, userNames, averageAge, youngUser });

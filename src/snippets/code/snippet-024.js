function createCounter() {
  let count = 0;
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
}

const counter1 = createCounter();
console.log('Counter 1:');
console.log(counter1.increment());
console.log(counter1.increment());
console.log(counter1.getCount());

const counter2 = createCounter();
console.log('\nCounter 2:');
console.log(counter2.increment());
console.log(counter2.getCount());

console.log('\nCounter 1 after Counter 2:');
console.log(counter1.getCount());

console.log('\nTrying to access count directly:');
console.log(counter1.count);

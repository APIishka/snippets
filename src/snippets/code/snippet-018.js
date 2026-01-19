function withLogging(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name} with args:`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}

function withTiming(fn) {
  return function(...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${fn.name} took ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

function add(a, b) {
  return a + b;
}

const decoratedAdd = withTiming(withLogging(add));

decoratedAdd(5, 3);

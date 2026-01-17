const debounce = (func, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 500);

const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 1000);

export { debounce, throttle };

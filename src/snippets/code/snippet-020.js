class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

const emitter = new EventEmitter();

const unsubscribe = emitter.subscribe('userLogin', (user) => {
  console.log('User logged in:', user);
});

emitter.emit('userLogin', { name: 'Alice', id: 1 });
unsubscribe();

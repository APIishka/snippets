console.log('=== Closure with VAR (function scope) ===');
function testVar() {
  var message = 'Hello from var';
  
  setTimeout(function() {
    console.log(message);
  }, 100);
  
  message = 'Modified var';
}
testVar();

setTimeout(() => {
  console.log('\n=== Closure with CONST (block scope) ===');
  function testConst() {
    const message = 'Hello from const';
    
    setTimeout(function() {
      console.log(message);
    }, 100);
  }
  testConst();
}, 200);

setTimeout(() => {
  console.log('\n=== VAR in blocks - leaks to function scope ===');
  function varLeak() {
    if (true) {
      var leakedVar = 'I leak out of the block!';
    }
    console.log('Can access leakedVar:', leakedVar);
  }
  varLeak();
}, 400);

setTimeout(() => {
  console.log('\n=== LET in blocks - true block scope ===');
  function letNoLeak() {
    if (true) {
      let blockScoped = 'I stay in the block';
      console.log('Inside block:', blockScoped);
    }
    try {
      console.log('Outside block:', blockScoped);
    } catch (e) {
      console.log('Error: blockScoped is not defined');
    }
  }
  letNoLeak();
}, 600);

console.log('=== VAR - Classic Closure Problem ===');
var functionsVar = [];

for (var i = 0; i < 3; i++) {
  functionsVar.push(function() {
    console.log('var i:', i);
  });
}

functionsVar[0]();
functionsVar[1]();
functionsVar[2]();

console.log('\n=== LET - Fixes Closure Issue ===');
var functionsLet = [];

for (let j = 0; j < 3; j++) {
  functionsLet.push(function() {
    console.log('let j:', j);
  });
}

functionsLet[0]();
functionsLet[1]();
functionsLet[2]();

console.log('\n=== VAR Solution with IIFE ===');
var functionsIIFE = [];

for (var k = 0; k < 3; k++) {
  (function(index) {
    functionsIIFE.push(function() {
      console.log('IIFE index:', index);
    });
  })(k);
}

functionsIIFE[0]();
functionsIIFE[1]();
functionsIIFE[2]();

console.log('=== Event Listeners - VAR Problem ===');
const buttons = [];

for (var i = 0; i < 3; i++) {
  const button = { id: i };
  button.click = function() {
    console.log('Button (var):', i);
  };
  buttons.push(button);
}

buttons[0].click();
buttons[1].click();
buttons[2].click();

console.log('\n=== Event Listeners - LET Solution ===');
const buttonsLet = [];

for (let j = 0; j < 3; j++) {
  const button = { id: j };
  button.click = function() {
    console.log('Button (let):', j);
  };
  buttonsLet.push(button);
}

buttonsLet[0].click();
buttonsLet[1].click();
buttonsLet[2].click();

console.log('\n=== Array Methods - Closure Capture ===');
function createMultipliers() {
  const multipliers = [];
  
  for (let i = 1; i <= 3; i++) {
    multipliers.push(x => x * i);
  }
  
  return multipliers;
}

const funcs = createMultipliers();
console.log('2 * 1 =', funcs[0](2));
console.log('2 * 2 =', funcs[1](2));
console.log('2 * 3 =', funcs[2](2));

class PaymentStrategy {
  pay(amount) {
    throw new Error('Strategy must implement pay()');
  }
}

class CreditCardStrategy extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} with Credit Card`);
    return { method: 'credit_card', amount };
  }
}

class PayPalStrategy extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} with PayPal`);
    return { method: 'paypal', amount };
  }
}

class CryptoStrategy extends PaymentStrategy {
  pay(amount) {
    console.log(`Paid ${amount} with Cryptocurrency`);
    return { method: 'crypto', amount };
  }
}

class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  processPayment(amount) {
    return this.strategy.pay(amount);
  }
}

const processor = new PaymentProcessor(new CreditCardStrategy());
processor.processPayment(100);

processor.setStrategy(new PayPalStrategy());
processor.processPayment(50);

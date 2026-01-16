class BankAccount:
    
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance
    
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            return True
        return False
    
    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            return True
        return False
    
    @property
    def balance(self):
        return self.__balance
    
    def __str__(self):
        return f"{self.owner}'s account: ${self.__balance}"

account = BankAccount("John", 1000)
account.deposit(500)
account.withdraw(200)
print(account)
print(f"Balance: ${account.balance}")

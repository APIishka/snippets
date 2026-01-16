def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

def calculate(*args, **kwargs):
    total = sum(args)
    multiplier = kwargs.get('multiplier', 1)
    return total * multiplier

square = lambda x: x ** 2
add = lambda a, b: a + b

print(greet("Alice"))
print(greet("Bob", "Hi"))
print(calculate(1, 2, 3, 4, multiplier=2))
print(square(5))
print(add(10, 20))

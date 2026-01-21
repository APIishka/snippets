print("=== Variable Assignment Creates References ===")
x = [1, 2, 3]
y = x
z = x

print(f"x = {x}, id = {id(x)}")
print(f"y = {y}, id = {id(y)}")
print(f"z = {z}, id = {id(z)}")
print(f"All point to SAME object: {x is y is z}")

y.append(4)
print(f"\nAfter y.append(4):")
print(f"x = {x}")
print(f"y = {y}")
print(f"z = {z}")

print("\n=== Small Integer Caching (-5 to 256) ===")
a = 100
b = 100
print(f"a = {a}, b = {b}")
print(f"a is b: {a is b}")
print(f"Python caches small integers!")

c = 1000
d = 1000
print(f"\nc = {c}, d = {d}")
print(f"c is d: {c is d}")
print(f"Large integers are different objects!")

print("\n=== String Interning ===")
s1 = "hello"
s2 = "hello"
print(f"s1 is s2: {s1 is s2}")
print(f"Short strings are interned!")

s3 = "hello world with spaces"
s4 = "hello world with spaces"
print(f"\ns3 is s4: {s3 is s4}")
print(f"Longer strings might not be interned")

print("\n=== is vs == ===")
list1 = [1, 2, 3]
list2 = [1, 2, 3]

print(f"list1 == list2: {list1 == list2} (same values)")
print(f"list1 is list2: {list1 is list2} (different objects)")

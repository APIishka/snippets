print("=== Immutable types - Create new objects ===")
immutable_types = {
    'int': 42,
    'float': 3.14,
    'str': "hello",
    'tuple': (1, 2, 3),
    'bool': True,
    'frozenset': frozenset([1, 2, 3])
}

x = 100
print(f"x = {x}, id = {id(x)}")
x = x + 1
print(f"x = {x}, id = {id(x)} (NEW object!)")

s = "hello"
print(f"\ns = '{s}', id = {id(s)}")
s = s + " world"
print(f"s = '{s}', id = {id(s)} (NEW object!)")

print("\n=== Mutable types - Modify in place ===")
mutable_types = {
    'list': [1, 2, 3],
    'dict': {'a': 1},
    'set': {1, 2, 3}
}

my_list = [1, 2, 3]
print(f"my_list = {my_list}, id = {id(my_list)}")
my_list.append(4)
print(f"my_list = {my_list}, id = {id(my_list)} (SAME object!)")

my_dict = {'a': 1, 'b': 2}
print(f"\nmy_dict = {my_dict}, id = {id(my_dict)}")
my_dict['c'] = 3
print(f"my_dict = {my_dict}, id = {id(my_dict)} (SAME object!)")

print("\n=== Immutable tuple containing mutable list ===")
t = ([1, 2], [3, 4])
print(f"t = {t}, id = {id(t)}")
t[0].append(99)
print(f"t = {t}, id = {id(t)}")
print("Tuple itself is immutable, but contents can change!")

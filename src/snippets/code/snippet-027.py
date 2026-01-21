a = 5
b = a
print(f"a = {a}, b = {b}")
print(f"id(a) = {id(a)}, id(b) = {id(b)}")

b = 10
print(f"\nAfter b = 10:")
print(f"a = {a}, b = {b}")
print(f"id(a) = {id(a)}, id(b) = {id(b)}")

list1 = [1, 2, 3]
list2 = list1
print(f"\nlist1 = {list1}, list2 = {list2}")
print(f"id(list1) = {id(list1)}, id(list2) = {id(list2)}")

list2.append(4)
print(f"\nAfter list2.append(4):")
print(f"list1 = {list1}, list2 = {list2}")
print(f"Same object: {list1 is list2}")

list3 = list1.copy()
list3.append(5)
print(f"\nAfter list3 = list1.copy():")
print(f"list1 = {list1}, list3 = {list3}")
print(f"Same object: {list1 is list3}")

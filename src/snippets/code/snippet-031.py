print("=== Shallow Copy vs Deep Copy ===")
import copy

original = [1, [2, 3], 4]
print(f"original = {original}")

shallow = original.copy()
shallow[0] = 99
shallow[1].append(999)

print(f"\nAfter shallow copy modification:")
print(f"original = {original}")
print(f"shallow = {shallow}")
print("Notice: Nested list [2, 3, 999] changed in BOTH!")

original2 = [1, [2, 3], 4]
deep = copy.deepcopy(original2)
deep[0] = 99
deep[1].append(999)

print(f"\nAfter deep copy modification:")
print(f"original2 = {original2}")
print(f"deep = {deep}")
print("Notice: original2 unchanged - completely independent!")

print("\n=== Default Mutable Arguments (DANGER!) ===")
def add_item_wrong(item, items=[]):
    items.append(item)
    return items

result1 = add_item_wrong('a')
result2 = add_item_wrong('b')
result3 = add_item_wrong('c')

print(f"result1 = {result1}")
print(f"result2 = {result2}")
print(f"result3 = {result3}")
print("All share the SAME list!")

def add_item_correct(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

result4 = add_item_correct('a')
result5 = add_item_correct('b')

print(f"\nCorrect version:")
print(f"result4 = {result4}")
print(f"result5 = {result5}")
print("Each call gets new list!")

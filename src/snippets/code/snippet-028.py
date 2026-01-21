def modify_immutable(x):
    print(f"Inside function (before): x = {x}, id = {id(x)}")
    x = x + 10
    print(f"Inside function (after): x = {x}, id = {id(x)}")
    return x

def modify_mutable(lst):
    print(f"Inside function (before): lst = {lst}, id = {id(lst)}")
    lst.append(4)
    print(f"Inside function (after): lst = {lst}, id = {id(lst)}")

def replace_mutable(lst):
    print(f"Inside function (before): lst = {lst}, id = {id(lst)}")
    lst = [99, 100]
    print(f"Inside function (after reassignment): lst = {lst}, id = {id(lst)}")
    return lst

if __name__ == "__main__":
    print("=== Immutable (int) ===")
    num = 5
    print(f"Before: num = {num}, id = {id(num)}")
    result = modify_immutable(num)
    print(f"After: num = {num}, id = {id(num)}")
    print(f"Result: {result}\n")
    
    print("=== Mutable (list) - Modify in place ===")
    my_list = [1, 2, 3]
    print(f"Before: my_list = {my_list}, id = {id(my_list)}")
    modify_mutable(my_list)
    print(f"After: my_list = {my_list}, id = {id(my_list)}\n")
    
    print("=== Mutable (list) - Reassignment ===")
    my_list2 = [1, 2, 3]
    print(f"Before: my_list2 = {my_list2}, id = {id(my_list2)}")
    new_list = replace_mutable(my_list2)
    print(f"After: my_list2 = {my_list2}, id = {id(my_list2)}")
    print(f"Returned: new_list = {new_list}")

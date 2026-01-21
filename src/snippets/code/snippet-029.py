global_var = "I'm global"

def test_scope():
    local_var = "I'm local"
    print(f"Inside function - local_var: {local_var}")
    print(f"Inside function - global_var: {global_var}")

test_scope()

try:
    print(local_var)
except NameError as e:
    print(f"\nError accessing local_var outside: {e}")

print("\n=== Modifying global variable ===")
counter = 0

def increment_wrong():
    counter = counter + 1
    return counter

try:
    increment_wrong()
except UnboundLocalError as e:
    print(f"Error: {e}")

def increment_correct():
    global counter
    counter = counter + 1
    return counter

print(f"Before: counter = {counter}")
increment_correct()
print(f"After: counter = {counter}")

print("\n=== Nonlocal in nested functions ===")
def outer():
    count = 0
    
    def inner():
        nonlocal count
        count += 1
        print(f"Inner count: {count}")
    
    inner()
    inner()
    print(f"Outer count: {count}")

outer()

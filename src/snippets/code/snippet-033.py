def outer_function(x):
    outer_var = "I'm in outer scope"
    
    def inner_function(y):
        inner_var = "I'm in inner scope"
        
        print(f"Inner can access:")
        print(f"  - inner_var: {inner_var}")
        print(f"  - outer_var: {outer_var}")
        print(f"  - parameter x: {x}")
        print(f"  - parameter y: {y}")
        print(f"  - global len: {len([1, 2, 3])}")
        
        return x + y
    
    result = inner_function(10)
    print(f"\nOuter can access:")
    print(f"  - outer_var: {outer_var}")
    print(f"  - parameter x: {x}")
    
    try:
        print(f"  - inner_var: {inner_var}")
    except NameError:
        print(f"  - inner_var: ERROR - not accessible!")
    
    return result

print("=== LEGB Scope Resolution ===")
print("L - Local (innermost)")
print("E - Enclosing (outer functions)")
print("G - Global (module level)")
print("B - Built-in (Python's built-ins)\n")

result = outer_function(5)
print(f"\nResult: {result}")

print("\n=== Closure - Inner function remembers outer scope ===")
def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply

times_3 = make_multiplier(3)
times_5 = make_multiplier(5)

print(f"times_3(10) = {times_3(10)}")
print(f"times_5(10) = {times_5(10)}")
print(f"Each closure remembers its own 'n' value!")

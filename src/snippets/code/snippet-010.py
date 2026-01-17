from typing import List, Dict, Optional

def get_user_by_id(users: List[Dict], user_id: int) -> Optional[Dict]:
    for user in users:
        if user.get('id') == user_id:
            return user
    return None

def calculate_total(prices: List[float], tax_rate: float = 0.1) -> float:
    subtotal = sum(prices)
    tax = subtotal * tax_rate
    return round(subtotal + tax, 2)

def format_name(first: str, last: str, middle: Optional[str] = None) -> str:
    if middle:
        return f"{first} {middle} {last}"
    return f"{first} {last}"

if __name__ == "__main__":
    result = calculate_total([10.99, 24.50, 5.25])
    print(f"Total: ${result}")
    
    name = format_name("John", "Doe", "Michael")
    print(name)

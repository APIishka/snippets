def process_items(items, callback=None):
    results = []
    
    for item in items:
        try:
            processed = item.strip().lower()
            
            if callback:
                processed = callback(processed)
            
            results.append(processed)
        except AttributeError:
            print(f"Warning: Skipping non-string item: {item}")
            continue
    
    return results

if __name__ == "__main__":
    data = ["  Hello  ", "WORLD", "Python", 123, "Code"]
    output = process_items(data, lambda x: x.upper())
    print(output)

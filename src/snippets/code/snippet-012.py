class DataProcessor:
    def __init__(self, name):
        self._name = name
        self._data = []
    
    @property
    def name(self):
        return self._name
    
    @property
    def data(self):
        return self._data.copy()
    
    def add_item(self, item):
        if not item:
            raise ValueError("Item cannot be empty")
        self._data.append(item)
    
    def process(self):
        return [item.upper() for item in self._data if isinstance(item, str)]
    
    def __repr__(self):
        return f"DataProcessor(name='{self._name}', items={len(self._data)})"
    
    def __len__(self):
        return len(self._data)

if __name__ == "__main__":
    processor = DataProcessor("MyProcessor")
    processor.add_item("hello")
    processor.add_item("world")
    print(processor)
    print(processor.process())

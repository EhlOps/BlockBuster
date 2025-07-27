from blockbuster import block, registry
from typing import Optional

@block
def add(a: int, b: int, c: Optional[int]) -> int:
    """
    Adds two integers together.
    """
    return a + b

if __name__ == "__main__":
    print("Registered blocks:")
    for block, (_, data) in registry.items():
        print(block, data)
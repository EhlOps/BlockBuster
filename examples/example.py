from blockbuster import block


@block
def add(a: int, b: int) -> int:
    """
    Adds two integers together.
    """
    return a + b


@block
def subtract(a: int, b: int) -> int:
    """
    Subtracts the second integer from the first.
    """
    return a - b

"""
This module defines the registry for blocks in the BlockBuster system.
"""

from .block_utils.ast_type_analyzer import ASTTypeAnalyzer

type_analyzer = ASTTypeAnalyzer()


def block(func):
    """
    Decorator to mark a function as a block.

    This decorator can be used to define a block in the BlockBuster system.
    Blocks are the fundamental units of computation in BlockBuster.

    Returns:
        function: The decorated function, which is now a block.
    """
    func_io = type_analyzer.analyze_function_object(func)
    func_data = {
        "name": func.__name__,
        "doc": func.__doc__.strip() if func.__doc__ else "",
        "input": func_io.get("parameters", []),
        "output": func_io.get("return_annotation", None),
        "is_async": func_io.get("is_async", False),
    }
    registry[func.__name__] = (func, func_data)
    return func


class Registry(dict):
    """
    Registry for storing blocks.

    This class extends the list to hold registered blocks and their metadata.
    It can be used to iterate over all registered blocks.
    """

    def __init__(self):
        super().__init__()
        self._blocks_names = []

    def __repr__(self):
        return f"Registry({len(self)} blocks)"


registry = Registry()

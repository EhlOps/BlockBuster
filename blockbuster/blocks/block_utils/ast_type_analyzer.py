import ast
import inspect
from typing import Dict, Any

class ASTTypeAnalyzer:
    """Analyze function types using AST parsing."""
    
    def __init__(self):
        self.analyzed_functions = {}
    
    def analyze_from_source(self, source_code: str) -> Dict[str, Any]:
        """Analyze function types from source code."""
        tree = ast.parse(source_code)
        
        functions = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_analysis = self._analyze_function_node(node)
                functions[node.name] = func_analysis
        
        return functions
    
    def analyze_function_object(self, func) -> Dict[str, Any]:
        """Analyze a function object by getting its source."""
        try:
            source = inspect.getsource(func)
            functions = self.analyze_from_source(source)
            return functions.get(func.__name__, {})
        except (OSError, TypeError):
            return {'error': 'Could not get source code'}
    
    def _analyze_function_node(self, node: ast.FunctionDef) -> Dict[str, Any]:
        """Analyze a single function AST node."""
        analysis = {
            'parameters': [],
            'return_annotation': None,
            'is_async': isinstance(node, ast.AsyncFunctionDef),
        }
        
        # Analyze parameters
        for arg in node.args.args:
            param_info = {
                'name': arg.arg,
                'annotation': self._annotation_to_string(arg.annotation) if arg.annotation else None,
                'kind': 'positional_or_keyword'
            }
            analysis['parameters'].append(param_info)
        
        # Handle *args
        if node.args.vararg:
            param_info = {
                'name': node.args.vararg.arg,
                'annotation': self._annotation_to_string(node.args.vararg.annotation) if node.args.vararg.annotation else None,
                'kind': 'var_positional'
            }
            analysis['parameters'].append(param_info)
        
        # Handle keyword-only arguments
        for arg in node.args.kwonlyargs:
            param_info = {
                'name': arg.arg,
                'annotation': self._annotation_to_string(arg.annotation) if arg.annotation else None,
                'kind': 'keyword_only'
            }
            analysis['parameters'].append(param_info)
        
        # Handle **kwargs
        if node.args.kwarg:
            param_info = {
                'name': node.args.kwarg.arg,
                'annotation': self._annotation_to_string(node.args.kwarg.annotation) if node.args.kwarg.annotation else None,
                'kind': 'var_keyword'
            }
            analysis['parameters'].append(param_info) 
        
        # Return annotation
        if node.returns:
            analysis['return_annotation'] = self._annotation_to_string(node.returns)
        
        return analysis
    
    def _annotation_to_string(self, annotation) -> str:
        """Convert AST annotation to string."""
        if annotation is None:
            return None
        try:
            return ast.unparse(annotation)
        except:
            return str(annotation)
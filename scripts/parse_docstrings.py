import os
import ast
import json

def parse_py_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        node = ast.parse(f.read(), filename=filepath)
    
    classes = {}
    functions = {}

    for item in node.body:
        if isinstance(item, ast.ClassDef):
            class_info = {
                'name': item.name,
                'docstring': ast.get_docstring(item) or '',
                'properties': [],
                'methods': []
            }
            
            for subitem in item.body:
                if isinstance(subitem, ast.FunctionDef):
                    # Check decorators to see if it is a property
                    is_prop = False
                    for dec in subitem.decorator_list:
                        if isinstance(dec, ast.Name) and dec.id == 'property':
                            is_prop = True
                            break
                    
                    method_doc = ast.get_docstring(subitem) or ''
                    # Get signature
                    args = []
                    for arg in subitem.args.args:
                        args.append(arg.arg)
                    
                    sig = f"{subitem.name}({', '.join(args)})"
                    
                    if is_prop:
                        class_info['properties'].append({
                            'name': subitem.name,
                            'docstring': method_doc.split('\n')[0] if method_doc else ''
                        })
                    else:
                        if not subitem.name.startswith('_') or subitem.name in ['__add__', '__sub__', '__mul__', '__truediv__', '__pow__']:
                            class_info['methods'].append({
                                'name': subitem.name,
                                'signature': sig,
                                'docstring': method_doc.split('\n')[0] if method_doc else ''
                            })
                            
            classes[item.name] = class_info
            
        elif isinstance(item, ast.FunctionDef):
            if not item.name.startswith('_'):
                func_doc = ast.get_docstring(item) or ''
                args = [arg.arg for arg in item.args.args]
                functions[item.name] = {
                    'name': item.name,
                    'signature': f"{item.name}({', '.join(args)})",
                    'docstring': func_doc.split('\n')[0] if func_doc else ''
                }
                
    return classes, functions

def main():
    physure_dir = '/home/irvint/Projects/physure/physure'
    output_json = '/home/irvint/Projects/physure-landing/src/data/api-docstrings.json'
    
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    
    # Files to parse
    quantity_py = os.path.join(physure_dir, 'domain', 'measurement', 'quantity.py')
    init_py = os.path.join(physure_dir, '__init__.py')
    
    all_classes = {}
    all_functions = {}
    
    if os.path.exists(quantity_py):
        classes, funcs = parse_py_file(quantity_py)
        all_classes.update(classes)
        all_functions.update(funcs)
        
    if os.path.exists(init_py):
        classes, funcs = parse_py_file(init_py)
        all_classes.update(classes)
        all_functions.update(funcs)
        
    # Build clean output structure
    output_data = {
        'classes': all_classes,
        'functions': all_functions
    }
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"Generated dynamic API JSON at: {output_json}")

if __name__ == '__main__':
    main()

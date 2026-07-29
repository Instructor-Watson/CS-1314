import ast
import unittest

ALLOW_INITIAL_STUDENT_ERROR = True


class FunctionCallCollector(ast.NodeVisitor):
    def __init__(self):
        self.function_calls = []
        self.import_aliases = {}
        self.instance_classes = {}

    def visit_Import(self, node):
        for alias in node.names:
            self.import_aliases[alias.asname or alias.name] = alias.name
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        module = node.module
        for alias in node.names:
            if alias.name == '*':
                continue
            full_name = f'{module}.{alias.name}'
            self.import_aliases[alias.asname or alias.name] = full_name
        self.generic_visit(node)

    def visit_Assign(self, node):
        if isinstance(node.value, ast.Call):
            class_name = self.get_full_name(node.value.func)
            if class_name:
                for target in node.targets:
                    if isinstance(target, ast.Name) and class_name == 'zipfile.ZipFile':
                        self.instance_classes[target.id] = class_name
        self.generic_visit(node)

    def visit_With(self, node):
        for item in node.items:
            if isinstance(item.context_expr, ast.Call):
                func_name = self.get_full_name(item.context_expr.func)
                if func_name and isinstance(item.optional_vars, ast.Name):
                    if func_name == 'zipfile.ZipFile':
                        self.instance_classes[item.optional_vars.id] = func_name
        self.generic_visit(node)

    def visit_Call(self, node):
        func_name = self.get_full_name(node.func)
        if func_name:
            if '.' in func_name:
                base, method = func_name.split('.', 1)
                if base in self.instance_classes:
                    func_name = f'{self.instance_classes[base]}.{method}'
            self.function_calls.append(func_name)
        self.generic_visit(node)

    def get_full_name(self, node):
        if isinstance(node, ast.Name):
            return self.import_aliases.get(node.id, node.id)
        if isinstance(node, ast.Attribute):
            value = self.get_full_name(node.value)
            return f'{value}.{node.attr}' if value else node.attr
        if isinstance(node, ast.Call):
            return self.get_full_name(node.func)
        return None


class TestAdvancedFileOperationsAssignment(unittest.TestCase):
    REQUIRED_FUNCTIONS = {
        'shutil.move',
        'shutil.copy',
        'shutil.copytree',
        'os.walk',
        'zipfile.ZipFile.write',
        'zipfile.ZipFile.extract',
        'zipfile.ZipFile.extractall',
    }

    @classmethod
    def setUpClass(cls):
        try:
            cls.tree = ast.parse(student_source, filename='student_submission.py')
        except SyntaxError as error:
            raise AssertionError(
                'Your code has a syntax error, so the advanced file-operations checks could not run. '
                f'Fix the syntax issue first: {error.msg} on line {error.lineno}.'
            )

        collector = FunctionCallCollector()
        collector.visit(cls.tree)
        cls.normalized_calls = cls._normalize_calls(collector)

    @classmethod
    def _normalize_calls(cls, collector):
        normalized = set()
        for call in collector.function_calls:
            if '.' in call:
                base, rest = call.split('.', 1)
            else:
                base, rest = call, ''

            normalized_base = collector.import_aliases.get(base, base)
            normalized_call = f'{normalized_base}.{rest}' if rest else normalized_base
            normalized.add(normalized_call)
        return normalized

    def test_uses_any_three_approved_advanced_file_operations(self):
        """uses any three approved advanced file operations from the assignment"""
        matched = self.get_matched_functions()
        if len(matched) >= 3:
            return

        self.fail(
            'This assignment only requires any 3 of the approved advanced file operations.\n\n'
            f'Detected approved operations: {", ".join(sorted(matched)) or "none found"}\n\n'
            'You can choose any 3 from this list:\n'
            f'{", ".join(sorted(self.REQUIRED_FUNCTIONS))}\n\n'
            'Add one or more of those operations until your code uses at least 3 of them.'
        )

    def get_matched_functions(self):
        matched = set()
        for required in self.REQUIRED_FUNCTIONS:
            for call in self.normalized_calls:
                if '.' in required:
                    if call.endswith(required):
                        matched.add(required)
                        break
                else:
                    if call == required or call.endswith(f'.{required}'):
                        matched.add(required)
                        break
        return matched


if __name__ == '__main__':
    unittest.main()

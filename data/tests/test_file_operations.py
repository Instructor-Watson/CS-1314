import ast
import unittest


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
                    if isinstance(target, ast.Name):
                        if class_name == 'pathlib.Path':
                            self.instance_classes[target.id] = 'pathlib.Path'
                        elif class_name == 'open':
                            self.instance_classes[target.id] = 'file'
        elif isinstance(node.value, ast.BinOp) and isinstance(node.value.op, ast.Div):
            left = node.value.left
            if isinstance(left, ast.Name) and left.id in self.instance_classes:
                if self.instance_classes[left.id] == 'pathlib.Path':
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            self.instance_classes[target.id] = 'pathlib.Path'
        self.generic_visit(node)

    def visit_With(self, node):
        for item in node.items:
            if isinstance(item.context_expr, ast.Call):
                func_name = self.get_full_name(item.context_expr.func)
                if func_name and isinstance(item.optional_vars, ast.Name):
                    if func_name == 'open' or func_name.endswith('.open'):
                        self.instance_classes[item.optional_vars.id] = 'file'
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


class TestFileOperationsAssignment(unittest.TestCase):
    REQUIRED_FUNCTIONS = {
        'pathlib.Path.is_file',
        'pathlib.Path.mkdir',
        'pathlib.Path.glob',
        'open',
        'read',
        'write',
    }

    @classmethod
    def setUpClass(cls):
        try:
            cls.tree = ast.parse(student_source, filename='student_submission.py')
        except SyntaxError as error:
            raise AssertionError(
                'Your code has a syntax error, so the file-operations checks could not run. '
                f'Fix the syntax issue first: {error.msg} on line {error.lineno}.'
            )

        collector = FunctionCallCollector()
        collector.visit(cls.tree)
        cls.normalized_calls = cls._normalize_calls(collector)
        cls.collector = collector

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

    def test_uses_pathlib_to_check_files_and_make_directories(self):
        """uses pathlib to check files and create directories"""
        missing = self.find_missing({'pathlib.Path.is_file', 'pathlib.Path.mkdir'})
        if missing:
            self.fail(
                'We expected your code to use pathlib for checking files and creating directories.\n\n'
                f'Missing function usage: {", ".join(sorted(missing))}\n\n'
                'Use Path.is_file() to check for a file and Path.mkdir() to create a directory.'
            )

    def test_uses_open_write_and_read_for_file_io(self):
        """uses open(), write(), and read() for file input and output"""
        missing = self.find_missing({'open', 'write', 'read'})
        if missing:
            self.fail(
                'We expected your code to open a file, write to it, and read from it.\n\n'
                f'Missing function usage: {", ".join(sorted(missing))}\n\n'
                'Use open() together with write() and read() in your file I/O section.'
            )

    def test_uses_glob_to_list_files_in_a_directory(self):
        """uses glob() to list files in a directory"""
        missing = self.find_missing({'pathlib.Path.glob'})
        if missing:
            self.fail(
                'We expected your code to list files with Path.glob().\n\n'
                'Use Path(".").glob("*") or a similar call to loop through files in a directory.'
            )

    def test_uses_all_required_file_operation_calls(self):
        """uses all required file-operation function calls somewhere in the assignment"""
        missing = self.find_missing(self.REQUIRED_FUNCTIONS)
        if missing:
            self.fail(
                'Your code is missing some of the required file-operation function calls.\n\n'
                f'Required calls: {", ".join(sorted(self.REQUIRED_FUNCTIONS))}\n'
                f'Detected calls: {", ".join(sorted(self.get_matched_functions())) or "none found"}\n'
                f'Missing calls: {", ".join(sorted(missing))}'
            )

    def find_missing(self, required_functions):
        matched = set()
        for required in required_functions:
            for call in self.normalized_calls:
                if '.' in required:
                    if call.endswith(required):
                        matched.add(required)
                        break
                else:
                    if call == required or call.endswith(f'.{required}'):
                        matched.add(required)
                        break
        return set(required_functions) - matched

    def get_matched_functions(self):
        return self.REQUIRED_FUNCTIONS - self.find_missing(self.REQUIRED_FUNCTIONS)


if __name__ == '__main__':
    unittest.main()

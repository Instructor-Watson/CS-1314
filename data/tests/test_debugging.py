import ast
import unittest

ALLOW_INITIAL_STUDENT_ERROR = True


class AssignmentCriteriaChecker(ast.NodeVisitor):
    LOGGING_LEVELS = {'debug', 'info', 'warning', 'error', 'critical'}

    def __init__(self):
        self.logging_imported = False
        self.logging_aliases = set()
        self.logger_instances = set()
        self.logging_levels_used = set()
        self.logging_to_file = False
        self.try_except_pairs = []
        self.exceptions_raised = set()
        self.exceptions_handled = set()

    def visit_Import(self, node):
        for alias in node.names:
            if alias.name == 'logging':
                self.logging_imported = True
                self.logging_aliases.add(alias.asname or alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module == 'logging':
            self.logging_imported = True
            for alias in node.names:
                self.logging_aliases.add(alias.asname or alias.name)
        self.generic_visit(node)

    def visit_Assign(self, node):
        if isinstance(node.value, ast.Call):
            func_name = self.get_full_name(node.value.func)
            if func_name == 'logging.getLogger':
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        self.logger_instances.add(target.id)
        self.generic_visit(node)

    def visit_Try(self, node):
        exceptions_in_try = set()
        exceptions_in_except = set()

        for stmt in node.body:
            for sub_stmt in ast.walk(stmt):
                if isinstance(sub_stmt, ast.Raise) and sub_stmt.exc:
                    exc_name = self.get_exception_name(sub_stmt.exc)
                    if exc_name:
                        exceptions_in_try.add(exc_name)

        for handler in node.handlers:
            if handler.type:
                exc_name = self.get_exception_name(handler.type)
                if exc_name:
                    exceptions_in_except.add(exc_name)
            else:
                exceptions_in_except.add('BaseException')

        handled_exceptions = exceptions_in_try & exceptions_in_except
        if handled_exceptions or ('BaseException' in exceptions_in_except and exceptions_in_try):
            self.try_except_pairs.append((node.lineno, handled_exceptions or exceptions_in_try))

        self.exceptions_raised.update(exceptions_in_try)
        self.exceptions_handled.update(exceptions_in_except)
        self.generic_visit(node)

    def visit_Call(self, node):
        func_name = self.get_full_name(node.func)
        if func_name:
            base_name = func_name.split('.')[0]
            method_name = func_name.split('.')[-1]

            if base_name in self.logging_aliases or base_name in self.logger_instances:
                if method_name in self.LOGGING_LEVELS:
                    self.logging_levels_used.add(method_name)
                elif method_name == 'basicConfig':
                    if any(keyword.arg == 'filename' for keyword in node.keywords):
                        self.logging_to_file = True
                elif method_name == 'FileHandler':
                    self.logging_to_file = True

        self.generic_visit(node)

    def get_exception_name(self, node):
        if isinstance(node, ast.Call):
            return self.get_full_name(node.func)
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            return self.get_full_name(node)
        return ''

    def get_full_name(self, node):
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            value = self.get_full_name(node.value)
            return f'{value}.{node.attr}' if value else node.attr
        return ''


class TestDebuggingAssignment(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            cls.tree = ast.parse(student_source, filename='student_submission.py')
        except SyntaxError as error:
            raise AssertionError(
                'Your code has a syntax error, so the debugging checks could not run. '
                f'Fix the syntax issue first: {error.msg} on line {error.lineno}.'
            )

        cls.checker = AssignmentCriteriaChecker()
        cls.checker.visit(cls.tree)

    def test_try_except_raises_and_handles_exception(self):
        """raises and handles an exception with try/except"""
        if self.checker.try_except_pairs:
            return

        raised = ', '.join(sorted(self.checker.exceptions_raised)) or 'none found'
        handled = ', '.join(sorted(self.checker.exceptions_handled)) or 'none found'
        self.fail(
            'We looked for a try/except block where your code intentionally raises an exception in the '
            'try block and handles that same exception in the except block.\n\n'
            f'Exceptions raised in your code: {raised}\n'
            f'Exceptions handled in your code: {handled}\n\n'
            'Make sure you raise an exception inside try and catch that exception in except.'
        )

    def test_logging_writes_to_a_file(self):
        """configures logging to write messages to a file"""
        if not self.checker.logging_imported:
            self.fail(
                'Your code needs to import the logging module before you configure it or write log messages.'
            )

        if self.checker.logging_to_file:
            return

        self.fail(
            'Your code uses logging, but we could not find it writing to a file.\n\n'
            'Configure logging with a filename in logging.basicConfig(...) or create a FileHandler.'
        )

    def test_logging_uses_multiple_levels(self):
        """uses at least two different logging levels"""
        if not self.checker.logging_imported:
            self.fail(
                'Your code needs to import the logging module before using logging levels like info or error.'
            )

        if len(self.checker.logging_levels_used) >= 2:
            return

        levels_found = ', '.join(sorted(self.checker.logging_levels_used)) or 'none found'
        self.fail(
            'We expected your program to use at least two different logging levels, such as info and error.\n\n'
            f'Logging levels found in your code: {levels_found}\n\n'
            'Add another logging call at a different level so the program demonstrates multiple logging levels.'
        )


if __name__ == '__main__':
    unittest.main()


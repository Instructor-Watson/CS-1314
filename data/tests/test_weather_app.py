import ast
import unittest

ALLOW_INITIAL_STUDENT_ERROR = True


class WeatherAPIChecker(ast.NodeVisitor):
    def __init__(self):
        self.requests_imported = False
        self.import_aliases = {}
        self.get_calls = []
        self.forecast_url_extracted = False
        self.detailed_forecast_printed = False
        self.forecast_url_vars = set()
        self.first_period_vars = set()
        self.detailed_forecast_vars = set()
        self.print_nodes = []

    def visit_Import(self, node):
        for alias in node.names:
            if alias.name == 'requests':
                self.requests_imported = True
                self.import_aliases[alias.asname or alias.name] = 'requests'
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module == 'requests':
            self.requests_imported = True
            for alias in node.names:
                self.import_aliases[alias.asname or alias.name] = f'requests.{alias.name}'
        self.generic_visit(node)

    def visit_Call(self, node):
        func_name = self.get_full_name(node.func)
        if func_name:
            for alias, actual in self.import_aliases.items():
                if func_name.startswith(alias):
                    func_name = func_name.replace(alias, actual, 1)

            if func_name == 'requests.get':
                self.get_calls.append(node)
            elif func_name == 'print':
                self.print_nodes.append(node)
        self.generic_visit(node)

    def visit_Assign(self, node):
        if isinstance(node.value, ast.Subscript):
            keys = self.extract_keys(node.value)
            if keys == ['properties', 'forecast']:
                var_name = self.get_var_name(node.targets)
                if var_name:
                    self.forecast_url_vars.add(var_name)
                    self.forecast_url_extracted = True
            elif keys == ['properties', 'periods', 0]:
                var_name = self.get_var_name(node.targets)
                if var_name:
                    self.first_period_vars.add(var_name)
            elif keys == ['properties', 'periods', 0, 'detailedForecast']:
                var_name = self.get_var_name(node.targets)
                if var_name:
                    self.detailed_forecast_vars.add(var_name)
        self.generic_visit(node)

    def get_full_name(self, node):
        if isinstance(node, ast.Name):
            return self.import_aliases.get(node.id, node.id)
        if isinstance(node, ast.Attribute):
            value = self.get_full_name(node.value)
            return f'{value}.{node.attr}' if value else None
        return None

    def extract_keys(self, node):
        keys = []
        while isinstance(node, ast.Subscript):
            index = node.slice.value if isinstance(node.slice, ast.Index) else node.slice
            if isinstance(index, ast.Constant):
                keys.insert(0, index.value)
            else:
                return []
            node = node.value
        return keys

    def get_var_name(self, targets):
        for target in targets:
            if isinstance(target, ast.Name):
                return target.id
        return None

    def check_detailed_forecast_printed(self):
        for print_call in self.print_nodes:
            for arg in print_call.args:
                if self.is_detailed_forecast_arg(arg):
                    self.detailed_forecast_printed = True
                    return

    def is_detailed_forecast_arg(self, node):
        if isinstance(node, ast.Name):
            return node.id in self.detailed_forecast_vars
        if isinstance(node, ast.Subscript):
            keys = self.extract_keys(node)
            if keys and keys[-1] == 'detailedForecast':
                base_var = self.get_base_var(node)
                if base_var in self.first_period_vars:
                    return True
            return keys == ['properties', 'periods', 0, 'detailedForecast']
        if isinstance(node, ast.JoinedStr):
            return any(
                isinstance(value, ast.FormattedValue) and self.is_detailed_forecast_arg(value.value)
                for value in node.values
            )
        if isinstance(node, ast.BinOp):
            return self.is_detailed_forecast_arg(node.left) or self.is_detailed_forecast_arg(node.right)
        if isinstance(node, ast.Call):
            return any(self.is_detailed_forecast_arg(arg) for arg in node.args)
        return False

    def get_base_var(self, node):
        while isinstance(node, ast.Subscript):
            node = node.value
        return node.id if isinstance(node, ast.Name) else None


class TestWeatherAppAssignment(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            cls.tree = ast.parse(student_source, filename='student_submission.py')
        except SyntaxError as error:
            raise AssertionError(
                'Your code has a syntax error, so the weather-app checks could not run. '
                f'Fix the syntax issue first: {error.msg} on line {error.lineno}.'
            )

        cls.checker = WeatherAPIChecker()
        cls.checker.visit(cls.tree)
        cls.checker.check_detailed_forecast_printed()

    def test_imports_the_requests_module(self):
        """imports the requests module for the weather API calls"""
        if self.checker.requests_imported:
            return

        self.fail(
            "Your code needs to import the requests module before it can call the weather API."
        )

    def test_makes_two_requests_get_calls(self):
        """makes two requests.get calls to fetch the points data and forecast"""
        if len(self.checker.get_calls) >= 2:
            return

        self.fail(
            'Your code should make two requests.get() calls.\n\n'
            f'Detected requests.get() calls: {len(self.checker.get_calls)}\n\n'
            'Use one request to get the forecast URL from the points endpoint, then a second request to fetch the forecast data.'
        )

    def test_extracts_the_forecast_url_from_the_first_response(self):
        """extracts the forecast URL from the first API response"""
        if self.checker.forecast_url_extracted:
            return

        self.fail(
            "Your code needs to extract the forecast URL from the first API response.\n\n"
            "Example: forecast_url = data['properties']['forecast']"
        )

    def test_prints_the_first_detailed_forecast(self):
        """prints the detailed forecast from the first forecast period"""
        if self.checker.detailed_forecast_printed:
            return

        self.fail(
            "Your code needs to print the detailed forecast from the first period.\n\n"
            "Example: forecast_data['properties']['periods'][0]['detailedForecast']"
        )


if __name__ == '__main__':
    unittest.main()

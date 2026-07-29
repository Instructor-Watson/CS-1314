import difflib
import unittest
from unittest.mock import patch


class TestOutput(unittest.TestCase):
    def test_single_expense_total(self):
        """one expense updates the running total"""
        self.run_test_case(("100.79", "Groceries", "done"), "Final Total Expenses: $100.79")

    def test_multiple_expenses_accumulate_total(self):
        """multiple expenses add up correctly"""
        self.run_test_case(("200.29", "PC parts", "150.12", "Desk", "done"), "Final Total Expenses: $350.41")

    def test_zero_expense_keeps_total_zero(self):
        """a zero expense keeps the total at zero"""
        self.run_test_case(("0", "Free item", "done"), "Final Total Expenses: $0")

    def test_large_expense_is_counted(self):
        """a large expense is counted correctly"""
        self.run_test_case(("100000", "Car", "done"), "Final Total Expenses: $100000.0")

    def test_invalid_text_input_leaves_total_zero(self):
        """text input is rejected and total stays zero"""
        self.run_test_case(("twenty", "done"), "Final Total Expenses: $0")

    def test_negative_expense_is_reprompted(self):
        """negative amount is reprompted before continuing"""
        self.run_test_case(("-50", "50", "negative test", "done"), "Final Total Expenses: $50.0")

    def test_invalid_input_between_valid_expenses(self):
        """bad entries between expenses are handled correctly"""
        self.run_test_case(("300", "Electronics", "badInput", "badInput", "120.55", "Misc", "done"), "Final Total Expenses: $420.55")

    def test_leading_spaces_in_amount_are_accepted(self):
        """amounts with leading spaces are accepted"""
        self.run_test_case(("  200.25", "leading spaces", "done"), "Final Total Expenses: $200.25")

    def test_done_immediately_reports_zero_total(self):
        """entering done right away reports zero total"""
        self.run_test_case(("done", "done"), "Final Total Expenses: $0")

    def test_invalid_entries_before_two_valid_expenses(self):
        """bad entries before valid expenses are handled correctly"""
        self.run_test_case(("badinput", "badinput", "487.25", "Jet payment", "10.50", "Flowers", "done"), "Final Total Expenses: $497.75")

    def run_test_case(self, inputs, expected):
        self.check_template_usage()

        with patch('builtins.input', side_effect=list(inputs)):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() in this assignment. Let the loop end naturally and print the final total."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        actual_output = result['stdout'].strip()
        actual_lines = actual_output.splitlines()
        matching_lines = [line for line in actual_lines if 'Final Total Expenses' in line]
        actual_line = matching_lines[-1] if matching_lines else (actual_lines[-1] if actual_lines else '')
        expected_line = expected.strip()

        if expected_line not in actual_line.strip():
            diff = self.get_difference(expected_line, actual_line.strip())
            unit_feedback = self.run_unit_tests()
            feedback_sections = [
                "We expected your output to contain:",
                "----",
                expected_line,
                "----",
                "",
                "This is what your code output:",
                "----",
                actual_line or '[no matching final total line found]',
                "----",
                "",
                "This is what you need to fix:",
                "--- Expected output",
                "+++ Your output",
                diff,
                "Please check your output formatting and calculations."
            ]

            if unit_feedback:
                feedback_sections.extend([
                    "",
                    "Function checks:",
                    unit_feedback
                ])

            self.fail('\n'.join(feedback_sections))

    def get_difference(self, expected_line, actual_line):
        diff = list(difflib.ndiff([expected_line], [actual_line]))
        return '\n'.join(diff)

    def check_template_usage(self):
        required_line = '# DO NOT DELETE THIS LINE - used by auto grader'
        if required_line not in student_source:
            print(
                '\nWARNING: It looks like you are not using the provided template. '
                'That can cause problems with the auto grader.\n'
            )

    def run_unit_tests(self):
        tests = [
            ('get_expense_amount', self._test_get_expense_amount, "Ensure 'get_expense_amount' handles invalid inputs and negatives correctly."),
            ('get_expense_description', self._test_get_expense_description, "Ensure 'get_expense_description' correctly prompts and returns user input."),
            ('add_expense', self._test_add_expense, "Ensure 'add_expense' correctly adds the expense amount to the total."),
            ('display_total', self._test_display_total, "Ensure 'display_total' correctly prints the total expenses."),
        ]

        feedback = []

        for func_name, test_func, tip in tests:
            try:
                test_func()
                feedback.append(f"PASS: {func_name}")
            except AssertionError as error:
                feedback.append(f"FAIL: {func_name} - {error}")
                feedback.append(f"Tip: {tip}")
            except Exception as error:
                feedback.append(f"FAIL: {func_name} - unexpected {type(error).__name__}: {error}")
                feedback.append(f"Tip: {tip}")

        return '\n'.join(feedback)

    def _get_student_function(self, name):
        function_ref = globals().get(name)
        self.assertTrue(callable(function_ref), f"Expected a function named '{name}'.")
        return function_ref

    def _test_get_expense_amount(self):
        get_expense_amount = self._get_student_function('get_expense_amount')

        with patch('builtins.input', side_effect=['abc', '-5', '10', 'done']), patch('builtins.print'):
            result = get_expense_amount()
            self.assertEqual(result, 10.0, msg=f"Expected 10.0 after invalid inputs, got {result!r}.")
            result = get_expense_amount()
            self.assertEqual(result, 'done', msg=f"Expected 'done', got {result!r}.")

    def _test_get_expense_description(self):
        get_expense_description = self._get_student_function('get_expense_description')

        with patch('builtins.input', side_effect=['Dinner at a restaurant']), patch('builtins.print'):
            result = get_expense_description()
            self.assertEqual(
                result,
                'Dinner at a restaurant',
                msg=f"Expected 'Dinner at a restaurant', got {result!r}."
            )

    def _test_add_expense(self):
        add_expense = self._get_student_function('add_expense')
        total = 50

        with patch('builtins.print'):
            result = add_expense(20, total)
            self.assertEqual(result, 70, msg=f"Expected total to be 70 after adding 20, got {result!r}.")

    def _test_display_total(self):
        display_total = self._get_student_function('display_total')

        with patch('builtins.print') as mock_print:
            display_total(100)
            mock_print.assert_called_with('Total Expenses: $100')


if __name__ == '__main__':
    unittest.main()



import unittest
from unittest.mock import patch


class TestListsAssignment(unittest.TestCase):
    def test_seven_expenses_show_correct_total_and_top_three(self):
        """seven expenses produce the correct total and top three list"""
        self.run_test_case(
            ("824.18", "Utilities", "119.83", "Restaurant", "502.52", "Books", "317.33", "PC parts", "572.23", "Software", "528.73", "Clothes", "925.23", "Travel", "done"),
            "Total Expenses: $3790.05\nTop 3 Expenses\n1. $925.23 - Travel\n2. $824.18 - Utilities\n3. $572.23 - Software"
        )

    def test_ten_expenses_keep_highest_three_in_order(self):
        """ten expenses keep the three largest expenses in descending order"""
        self.run_test_case(
            ("241.69", "Books", "665.79", "Electronics", "12.36", "Travel", "270.4", "Groceries", "965.96", "Restaurant", "52.73", "Gym membership", "259.17", "PC parts", "126.7", "Concert tickets", "939.64", "Software", "240.55", "Gifts", "done"),
            "Total Expenses: $3774.99\nTop 3 Expenses\n1. $965.96 - Restaurant\n2. $939.64 - Software\n3. $665.79 - Electronics"
        )

    def test_thirteen_expenses_still_report_only_top_three(self):
        """many expenses still report only the highest three values"""
        self.run_test_case(
            ("65.02", "Software", "41.98", "Concert tickets", "63.93", "Travel", "200.41", "Books", "775.73", "Utilities", "779.2", "Groceries", "397.96", "Clothes", "673.44", "Electronics", "862.35", "Furniture", "69.51", "Restaurant", "890.23", "Gym membership", "80.75", "Gifts", "558.92", "Rent", "19.73", "PC parts", "done"),
            "Total Expenses: $5479.16\nTop 3 Expenses\n1. $890.23 - Gym membership\n2. $862.35 - Furniture\n3. $779.20 - Groceries"
        )

    def test_nine_expenses_mix_categories_and_sort_correctly(self):
        """a mixed set of expenses is totaled and ranked correctly"""
        self.run_test_case(
            ("759.84", "Furniture", "583.09", "Groceries", "987.39", "Clothes", "481.01", "Electronics", "79.91", "Gym membership", "492.68", "Car maintenance", "708.46", "Restaurant", "555.77", "Rent", "195.48", "Travel", "done"),
            "Total Expenses: $4843.63\nTop 3 Expenses\n1. $987.39 - Clothes\n2. $759.84 - Furniture\n3. $708.46 - Restaurant"
        )

    def test_eight_expenses_handle_decimal_values_correctly(self):
        """decimal expense amounts are added and sorted correctly"""
        self.run_test_case(
            ("720.31", "Utilities", "740.38", "Electronics", "65.12", "Car maintenance", "838.63", "Books", "945.68", "Restaurant", "80.39", "Groceries", "225.64", "Software", "110.1", "Travel", "done"),
            "Total Expenses: $3726.25\nTop 3 Expenses\n1. $945.68 - Restaurant\n2. $838.63 - Books\n3. $740.38 - Electronics"
        )

    def run_test_case(self, inputs, expected_output):
        with patch('builtins.input', side_effect=list(inputs)):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() in this assignment. Let the program finish naturally after printing the total and top expenses."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        actual_output = result['stdout'].strip()
        actual_lines = actual_output.splitlines() if actual_output else []
        expected_lines = expected_output.strip().splitlines()

        try:
            start_index = next(i for i, line in enumerate(actual_lines) if 'Total Expenses:' in line)
            relevant_actual_lines = actual_lines[start_index:start_index + len(expected_lines)]
            if relevant_actual_lines:
                total_line = relevant_actual_lines[0]
                relevant_actual_lines[0] = total_line[total_line.index('Total Expenses:'):]
        except StopIteration:
            relevant_actual_lines = []

        if relevant_actual_lines != expected_lines:
            differences = self._format_line_differences(expected_lines, relevant_actual_lines)
            self.fail(
                "Your program did not print the expected total and top-three summary.\n\n"
                f"Inputs used: {inputs}\n\n"
                "Expected summary:\n"
                f"----\n{expected_output}\n----\n\n"
                "Your summary:\n"
                f"----\n{chr(10).join(relevant_actual_lines) if relevant_actual_lines else '[Total Expenses line not found]'}\n----\n\n"
                f"Differences to fix:\n{differences}"
            )

    def _format_line_differences(self, expected_lines, actual_lines):
        differences = []
        max_len = max(len(expected_lines), len(actual_lines))
        for index in range(max_len):
            expected_line = expected_lines[index] if index < len(expected_lines) else '[Missing line]'
            actual_line = actual_lines[index] if index < len(actual_lines) else '[Missing line]'
            if expected_line != actual_line:
                differences.append(
                    f"Line {index + 1}:\n  Expected: {expected_line}\n  Got:      {actual_line}"
                )
        return '\n\n'.join(differences) if differences else 'No line differences captured.'


if __name__ == '__main__':
    unittest.main()

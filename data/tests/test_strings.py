import unittest
from unittest.mock import patch


class TestStringsAssignment(unittest.TestCase):
    EXPECTED_LINES = [
        'Sam\'s favorite quote is "Live long and prosper"',
        'Pythoning',
        'GO RAMS!',
        'Learning Python is Awesome!',
        'I like to add spaces before my input because I want to break things',
        'Great job! 1314 is a numeric value',
    ]

    def test_escape_characters_and_slicing_outputs_are_correct(self):
        """prints the escaped quote and the sliced Pythoning string correctly"""
        lines, _ = self.run_program()
        expected_slice = self.EXPECTED_LINES[0:2]
        actual_slice = lines[0:2]
        if actual_slice != expected_slice:
            self.fail(
                "The quote and slicing section did not match the expected output.\n\n"
                "Expected lines:\n"
                f"----\n{chr(10).join(expected_slice)}\n----\n\n"
                "Your lines:\n"
                f"----\n{chr(10).join(actual_slice) if actual_slice else '[missing output]'}\n----"
            )

    def test_uppercase_and_replace_transform_the_strings(self):
        """upper() and replace() produce the expected transformed strings"""
        lines, _ = self.run_program()
        expected_slice = self.EXPECTED_LINES[2:4]
        actual_slice = lines[2:4]
        if actual_slice != expected_slice:
            self.fail(
                "The upper() and replace() section did not match the expected output.\n\n"
                "Expected lines:\n"
                f"----\n{chr(10).join(expected_slice)}\n----\n\n"
                "Your lines:\n"
                f"----\n{chr(10).join(actual_slice) if actual_slice else '[missing output]'}\n----\n\n"
                "Make sure motto is converted to all uppercase and that fun is replaced with Awesome."
            )

    def test_strip_removes_leading_spaces(self):
        """strip() removes the leading spaces from the bad input string"""
        lines, _ = self.run_program()
        self.assert_line_equals(
            lines,
            4,
            self.EXPECTED_LINES[4],
            'The strip() section should print the sentence without the leading spaces.'
        )

    def test_numeric_validation_reprompts_until_digits_are_entered(self):
        """numeric validation keeps asking until the user enters digits"""
        lines, input_call_count = self.run_program()
        self.assert_line_equals(
            lines,
            5,
            self.EXPECTED_LINES[5],
            'The final success message should print the numeric value once the user enters digits.'
        )

        if input_call_count != 2:
            self.fail(
                'The numeric-validation loop should ask for input twice for the test inputs bad input and 1314.\n\n'
                f'Expected input() to be called 2 times, but it was called {input_call_count} times.'
            )

    def test_program_output_matches_the_expected_string_walkthrough(self):
        """program output matches the full string-manipulation walkthrough exactly"""
        lines, _ = self.run_program()
        if lines != self.EXPECTED_LINES:
            self.fail(
                "Your full program output did not exactly match the expected string-manipulation walkthrough.\n\n"
                "Expected output:\n"
                f"----\n{chr(10).join(self.EXPECTED_LINES)}\n----\n\n"
                "Your output:\n"
                f"----\n{chr(10).join(lines) if lines else '[no output]'}\n----\n\n"
                "Please check capitalization, punctuation, and any extra lines."
            )

    def run_program(self, inputs=('bad input', '1314')):
        with patch('builtins.input', side_effect=list(inputs)) as mock_input:
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail('Do not use sys.exit() in this assignment. Let the program finish after the string and validation output.')

        if result['error']:
            self.fail(f"Your program raised {result['errorType']}: {result['error']}")

        lines = result['stdout'].strip().splitlines() if result['stdout'].strip() else []
        return lines, mock_input.call_count

    def assert_line_equals(self, lines, index, expected, context_message):
        actual = lines[index] if index < len(lines) else '[missing line]'
        if actual != expected:
            self.fail(
                f"{context_message}\n\n"
                f"Expected line {index + 1}:\n----\n{expected}\n----\n\n"
                f"Your line {index + 1}:\n----\n{actual}\n----"
            )


if __name__ == '__main__':
    unittest.main()

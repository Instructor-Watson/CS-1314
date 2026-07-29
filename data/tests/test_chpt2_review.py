import unittest
from unittest.mock import patch


class TestChapterTwoReview(unittest.TestCase):
    def test_perfect_square_and_both_even(self):
        """perfect square case also reports both numbers as even"""
        expected_output = "\n".join([
            "100 is the perfect square of 10.",
            "10 and 100 are both even."
        ])
        self.run_test_case(("10", "100"), expected_output)

    def test_both_even_without_perfect_square(self):
        """both even numbers are reported without a perfect-square line"""
        self.run_test_case(("10", "12"), "10 and 12 are both even.")

    def test_first_even_second_odd(self):
        """even first number and odd second number are identified correctly"""
        self.run_test_case(("128", "25643"), "128 is even and 25643 is odd.")

    def test_first_odd_second_even(self):
        """odd first number and even second number are identified correctly"""
        self.run_test_case(
            ("23156412344562131", "2315683142312023876"),
            "23156412344562131 is odd and 2315683142312023876 is even."
        )

    def test_both_odd(self):
        """both odd numbers are reported correctly"""
        self.run_test_case(("1", "101"), "1 and 101 are both odd.")

    def run_test_case(self, inputs, expected_output):
        with patch('builtins.input', side_effect=list(inputs)):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() in this assignment. Let the program finish naturally after printing the results."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        actual_output = result['stdout'].strip()
        expected_output = expected_output.strip()

        if actual_output != expected_output:
            self.fail(
                "Your program did not print the expected chapter 2 review results.\n\n"
                f"Inputs used: {inputs}\n\n"
                "Expected output:\n"
                f"----\n{expected_output}\n----\n\n"
                "Your output:\n"
                f"----\n{actual_output or '[no output]'}\n----"
            )


if __name__ == '__main__':
    unittest.main()

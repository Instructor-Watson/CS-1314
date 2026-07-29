import unittest
from unittest.mock import patch


class TestChapterOneReview(unittest.TestCase):
    def test_ten_and_five_print_all_calculations(self):
        """prints all arithmetic results correctly for a basic whole-number case"""
        expected_output = "\n".join([
            "The sum of 10 + 5 is 15",
            "The difference of 10 - 5 is 5",
            "The quotient of 10 / 5 is 2.0",
            "The floored quotient of 10 / 5 is 2",
            "The product of 10 * 5 is 50",
            "The remainder of 10 / 5 is 0",
            "The power of 10 ** 5 is 100000"
        ])
        self.run_test_case(("10", "5"), expected_output)

    def test_fifty_eight_and_nine_print_all_calculations(self):
        """prints all arithmetic results correctly for a non-even division case"""
        expected_output = "\n".join([
            "The sum of 58 + 9 is 67",
            "The difference of 58 - 9 is 49",
            "The quotient of 58 / 9 is 6.444444444444445",
            "The floored quotient of 58 / 9 is 6",
            "The product of 58 * 9 is 522",
            "The remainder of 58 / 9 is 4",
            "The power of 58 ** 9 is 7427658739644928"
        ])
        self.run_test_case(("58", "9"), expected_output)

    def run_test_case(self, inputs, expected_output):
        with patch('builtins.input', side_effect=list(inputs)):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() in this assignment. Let the program finish naturally after printing the calculations."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        actual_output = result['stdout'].strip()
        expected_output = expected_output.strip()

        if actual_output != expected_output:
            self.fail(
                "Your program did not print the expected set of calculation results.\n\n"
                f"Inputs used: {inputs}\n\n"
                "Expected output:\n"
                f"----\n{expected_output}\n----\n\n"
                "Your output:\n"
                f"----\n{actual_output or '[no output]'}\n----"
            )


if __name__ == '__main__':
    unittest.main()

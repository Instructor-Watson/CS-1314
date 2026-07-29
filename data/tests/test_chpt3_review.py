import unittest
from unittest.mock import patch


class TestChapterThreeReview(unittest.TestCase):
    INVALID_MESSAGE = "That's not a valid number. Please try again."

    def test_one_invalid_entry_before_valid_number(self):
        """retries after one invalid entry and then squares the valid number"""
        self.run_test_case(
            ("twenty", "5"),
            invalid_attempts=1,
            expected_final_line="The square of 5.0 is 25.0."
        )

    def test_two_invalid_words_before_valid_number(self):
        """retries through two invalid words before accepting a valid number"""
        self.run_test_case(
            ("idk", "five", "25"),
            invalid_attempts=2,
            expected_final_line="The square of 25.0 is 625.0."
        )

    def test_multiple_invalid_text_entries_before_valid_number(self):
        """keeps asking again until a later valid number is entered"""
        self.run_test_case(
            ("sky", "blue", "7"),
            invalid_attempts=2,
            expected_final_line="The square of 7.0 is 49.0."
        )

    def test_alphanumeric_inputs_are_rejected_before_valid_number(self):
        """rejects alphanumeric input before squaring the valid number"""
        self.run_test_case(
            ("34notanumber", "1OO", "47"),
            invalid_attempts=2,
            expected_final_line="The square of 47.0 is 2209.0."
        )

    def test_blank_and_text_inputs_retry_until_valid_number(self):
        """handles blank and text inputs before a final valid number"""
        self.run_test_case(
            ("a bunch of letters", "not a number", "", "249"),
            invalid_attempts=3,
            expected_final_line="The square of 249.0 is 62001.0."
        )

    def run_test_case(self, inputs, invalid_attempts, expected_final_line):
        with patch('builtins.input', side_effect=list(inputs)):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() in this assignment. Keep asking until a valid number is entered."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        output = result['stdout'].strip()
        output_lines = output.splitlines() if output else []
        final_line = output_lines[-1] if output_lines else ''
        invalid_message_count = output.count(self.INVALID_MESSAGE)

        if invalid_message_count != invalid_attempts:
            self.fail(
                f"Expected the invalid-number message to appear {invalid_attempts} times, but it appeared {invalid_message_count} times.\n\n"
                f"Your output:\n----\n{output or '[no output]'}\n----"
            )

        if final_line != expected_final_line:
            self.fail(
                "Your final square message did not match the expected output.\n\n"
                f"Inputs used: {inputs}\n\n"
                f"Expected final line:\n----\n{expected_final_line}\n----\n\n"
                f"Your final line:\n----\n{final_line or '[no output]'}\n----"
            )


if __name__ == '__main__':
    unittest.main()

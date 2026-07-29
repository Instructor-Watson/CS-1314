import unittest


class TestDictionariesAssignment(unittest.TestCase):
    EXPECTED_LINES = [
        '325-777-8888',
        "{'Bob': '325-777-8888', 'Sally': '325-456-1234', 'Joe': '325-789-1234', 'Fred': '325-444-7891'}",
        '325-456-1234',
        'Not Found',
        "{'Bob': '325-777-8888', 'Sally': '325-456-1234', 'Joe': '325-789-1234', 'Fred': '325-444-7891'}",
        '325-456-1234',
        'Not Found',
        "{'Bob': '325-777-8888', 'Sally': '325-456-1234', 'Joe': '325-789-1234', 'Fred': '325-444-7891', 'Zach': 'Not Found'}",
        "Bob's phone number is 325-777-8888",
        "Sally's phone number is 325-456-1234",
        "Fred's phone number is 325-444-7891",
        "Zach's phone number is Not Found",
    ]

    def test_lookup_and_add_print_bob_and_fred(self):
        """prints Bob's number and adds Fred to the phonebook"""
        lines = self.run_program()
        self.assert_line_equals(
            lines,
            0,
            self.EXPECTED_LINES[0],
            "The program should print Bob's phone number first."
        )
        self.assert_line_equals(
            lines,
            1,
            self.EXPECTED_LINES[1],
            "After adding Fred, the printed dictionary should include Fred's phone number."
        )

    def test_get_keeps_missing_lookup_from_changing_dictionary(self):
        """get() returns existing values and leaves missing names unchanged"""
        lines = self.run_program()
        expected_slice = self.EXPECTED_LINES[2:5]
        actual_slice = lines[2:5]
        if actual_slice != expected_slice:
            self.fail(
                "The get() section did not match the expected output.\n\n"
                "Expected lines:\n"
                f"----\n{chr(10).join(expected_slice)}\n----\n\n"
                "Your lines:\n"
                f"----\n{chr(10).join(actual_slice) if actual_slice else '[missing output]'}\n----\n\n"
                "Use phonebook.get(..., 'Not Found') and make sure the dictionary stays unchanged after the missing lookup."
            )

    def test_setdefault_preserves_sally_and_adds_zach(self):
        """setdefault keeps Sally unchanged and adds Zach as missing"""
        lines = self.run_program()
        expected_slice = self.EXPECTED_LINES[5:8]
        actual_slice = lines[5:8]
        if actual_slice != expected_slice:
            self.fail(
                "The setdefault() section did not match the expected output.\n\n"
                "Expected lines:\n"
                f"----\n{chr(10).join(expected_slice)}\n----\n\n"
                "Your lines:\n"
                f"----\n{chr(10).join(actual_slice) if actual_slice else '[missing output]'}\n----\n\n"
                "Sally should keep her existing number, and Zach should be added with 'Not Found'."
            )

    def test_final_loop_lists_remaining_phone_numbers(self):
        """final loop prints the remaining phonebook entries after Joe is deleted"""
        lines = self.run_program()
        expected_slice = self.EXPECTED_LINES[8:12]
        actual_slice = lines[8:12]
        if actual_slice != expected_slice:
            self.fail(
                "The final phonebook listing did not match the expected output.\n\n"
                "Expected lines:\n"
                f"----\n{chr(10).join(expected_slice)}\n----\n\n"
                "Your lines:\n"
                f"----\n{chr(10).join(actual_slice) if actual_slice else '[missing output]'}\n----\n\n"
                "Delete Joe before looping with items(), and print each remaining person's phone number in the shown format."
            )

    def test_program_output_has_no_extra_lines(self):
        """program output matches the expected dictionary walkthrough exactly"""
        lines = self.run_program()
        if lines != self.EXPECTED_LINES:
            self.fail(
                "Your full program output did not exactly match the expected dictionary walkthrough.\n\n"
                "Expected output:\n"
                f"----\n{chr(10).join(self.EXPECTED_LINES)}\n----\n\n"
                "Your output:\n"
                f"----\n{chr(10).join(lines) if lines else '[no output]'}\n----\n\n"
                "Do not add extra blank lines or extra print statements."
            )

    def run_program(self):
        result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail('Do not use sys.exit() in this assignment. Let the script finish by printing the expected dictionary output.')

        if result['error']:
            self.fail(f"Your program raised {result['errorType']}: {result['error']}")

        return result['stdout'].strip().splitlines() if result['stdout'].strip() else []

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

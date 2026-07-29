import unittest
from unittest.mock import patch


class TestRegexAssignment(unittest.TestCase):
    def test_extracts_a_basic_email_address_from_text(self):
        """extracts a basic email address from surrounding text"""
        self.assert_email_match(
            "Hi my email is joe@example.com, thank you!",
            "joe@example.com"
        )

    def test_returns_not_found_when_no_email_exists(self):
        """returns no email found when the text has no email address"""
        self.assert_email_match(
            "Sorry I don't have an email.",
            "No email found"
        )

    def test_rejects_an_email_with_a_one_letter_domain_suffix(self):
        """rejects addresses whose final domain part is only one letter"""
        self.assert_email_match(
            "my email is badEmail@example.c",
            "No email found"
        )

    def test_allows_multiple_dots_in_the_domain_name(self):
        """allows an email address with multiple dotted domain sections"""
        self.assert_email_match(
            "Send your email to john.doe@mymail.example.com please.",
            "john.doe@mymail.example.com"
        )

    def test_main_prints_the_found_email_from_user_input(self):
        """main prints the email found in the user's input"""
        self.check_template_usage()

        with patch('builtins.input', side_effect=["you can @ my email anytime, just send it over to alan.turing@math.co.uk"]):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail('Do not use sys.exit() in this assignment. Let the program finish naturally after printing the email result.')

        if result['error']:
            self.fail(f"Your program raised {result['errorType']}: {result['error']}")

        output_lines = result['stdout'].strip().splitlines() if result['stdout'].strip() else []
        final_line = output_lines[-1] if output_lines else '[no output]'

        if final_line != 'alan.turing@math.co.uk':
            self.fail(
                "The full program did not print the expected email result.\n\n"
                "Expected final line:\n"
                "----\nalan.turing@math.co.uk\n----\n\n"
                "Your final line:\n"
                f"----\n{final_line}\n----"
            )

    def assert_email_match(self, text, expected):
        self.check_template_usage()
        get_email = self.get_student_function('get_email')

        try:
            actual = get_email(text)
        except Exception as error:
            self.fail(f"Calling get_email(...) raised {type(error).__name__}: {error}")

        if actual != expected:
            self.fail(
                "get_email(...) did not return the expected result.\n\n"
                f"Input text:\n----\n{text}\n----\n\n"
                f"Expected return value:\n----\n{expected}\n----\n\n"
                f"Actual return value:\n----\n{actual}\n----"
            )

    def get_student_function(self, name):
        function_ref = globals().get(name)
        self.assertTrue(callable(function_ref), f"Expected a function named '{name}'.")
        return function_ref

    def check_template_usage(self):
        required_line = '# DO NOT DELETE THIS LINE - used by auto grader'
        if required_line not in student_source:
            print(
                '\nWARNING: It looks like you are not using the provided template. '
                'That can cause problems with the auto grader.\n'
            )


if __name__ == '__main__':
    unittest.main()

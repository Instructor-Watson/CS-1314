import unittest
from unittest.mock import patch


class TestDiceSimulator(unittest.TestCase):
    def test_immediate_quit(self):
        """typing done exits cleanly and still prints Game Over"""
        self.check_template_usage()

        with patch('builtins.input', side_effect=['done']):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() here. Use break so the program can still print 'Game Over'."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        output = result['stdout']

        if 'Rolling...' in output:
            self.fail(
                "The program should not print 'Rolling...' when the user types 'done' right away."
            )

        if 'You rolled a' in output:
            self.fail(
                "The program should not show a dice roll when the user quits immediately."
            )

        if 'Game Over' not in output:
            self.fail(
                "Print 'Game Over' after the loop ends, even when the user quits immediately."
            )

    def test_roll_until_win(self):
        """rolling repeatedly reaches the seeded winning case"""
        self.check_template_usage()

        with patch('builtins.input', side_effect=['roll'] * 50):
            result = run_student_code()

        if result['errorType'] == 'SystemExit':
            self.fail(
                "Do not use sys.exit() here. Break out of the loop naturally after the win."
            )

        if result['errorType'] == 'StopIteration':
            self.fail(
                "Your program asked for more than 50 inputs. Check that you break the loop when a 6 is rolled."
            )

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        output = result['stdout']

        if 'Rolling...' not in output:
            self.fail(
                "Did not find 'Rolling...'. Use a for loop to print it before each roll."
            )

        if 'You rolled a six! You win!' not in output:
            self.fail(
                "Did not find the winning message: 'You rolled a six! You win!'"
            )

        if 'Game Over' not in output:
            self.fail(
                "Print 'Game Over' after the loop breaks."
            )

    def check_template_usage(self):
        required_line = '# DO NOT CHANGE the next line of code. I use this special function so your "random" numbers are predictable for grading purposes.'
        if required_line not in student_source:
            print(
                '\nWARNING: It looks like you removed the provided random-seed line from the template. '
                'That can change the expected rolls used by the grader.\n'
            )


if __name__ == '__main__':
    unittest.main()

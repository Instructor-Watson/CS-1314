import unittest

class TestHelloWorld(unittest.TestCase):
    def test_program_prints_hello_world(self):
        """Program prints Hello World!"""
        result = run_student_code()

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        output = result['stdout'].strip()
        error_message = f"Expected output 'Hello World!' but got '{output}'"
        self.assertEqual(output, 'Hello World!', msg=error_message)

if __name__ == '__main__':
    unittest.main()

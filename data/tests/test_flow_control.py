import difflib
import unittest
from unittest.mock import patch


class TestOutput(unittest.TestCase):
    def test_hot_sunny(self):
        """hot + sunny prints sunscreen advice"""
        self.run_test_case(("hot", "sunny"), "Wear sunscreen and drink plenty of water.")

    def test_hot_rainy(self):
        """hot + rainy prints umbrella advice"""
        self.run_test_case(("hot", "rainy"), "Wear light clothing and carry an umbrella.")

    def test_hot_snowy(self):
        """hot + snowy prints unusual-weather advice"""
        self.run_test_case(("hot", "snowy"), "This is an unusual combination! Stay indoors if possible.")

    def test_mild_sunny(self):
        """mild + sunny prints pleasant-weather advice"""
        self.run_test_case(("mild", "sunny"), "Enjoy the pleasant weather, maybe with a light jacket.")

    def test_mild_rainy(self):
        """mild + rainy prints waterproof advice"""
        self.run_test_case(("mild", "rainy"), "Carry an umbrella and wear a waterproof jacket.")

    def test_mild_snowy(self):
        """mild + snowy prints layers advice"""
        self.run_test_case(("mild", "snowy"), "Dress in layers and be prepared for cooler temperatures.")

    def test_cold_sunny(self):
        """cold + sunny prints warm-coat advice"""
        self.run_test_case(("cold", "sunny"), "Wear a warm coat but enjoy the sunshine.")

    def test_cold_rainy(self):
        """cold + rainy prints waterproof warm-jacket advice"""
        self.run_test_case(("cold", "rainy"), "Wear a warm waterproof jacket and carry an umbrella.")

    def test_cold_snowy(self):
        """cold + snowy prints winter-clothing advice"""
        self.run_test_case(("cold", "snowy"), "Wear a warm coat, gloves, and a hat.")

    def test_no_answer(self):
        """invalid weather falls back to retry message"""
        self.run_test_case(("cold", "blizzard"), "Please try again. You have provided an invalid option.")

    def run_test_case(self, inputs, expected):
        self.check_template_usage()

        with patch('builtins.input', side_effect=list(inputs)):
            result = run_student_code()

        if result['error']:
            self.fail(
                f"Your program raised {result['errorType']}: {result['error']}"
            )

        actual_output = result['stdout'].strip()

        if expected not in actual_output:
            self.fail(self.build_output_feedback(expected, actual_output))

    def build_output_feedback(self, expected, actual_output):
        expected_snippet, actual_snippet, matching_ratio = self.extract_relevant_output(expected, actual_output)
        is_close_match = matching_ratio >= 0.5 and expected_snippet and actual_snippet
        student_output_display = actual_output or '[no output]'

        if is_close_match:
            hint = self.describe_difference(expected_snippet, actual_snippet)
            lines = [
                "Your output is very close, but one small part is different.",
                "",
                "Check this part:",
                f"Expected: {expected_snippet!r}",
                f"Your output: {actual_snippet!r}"
            ]

            if hint:
                lines.extend(['', hint])

            lines.extend([
                '',
                "Check punctuation, capitalization, spacing, and wording near that spot."
            ])
            return '\n'.join(lines)

        hint = self.describe_difference(expected, actual_output)
        lines = [
            "Your output does not match the expected response from the instructions table yet.",
            "",
            f"Expected output: {expected!r}",
            f"Your output: {student_output_display!r}" if actual_output else "Your output: [no output]"
        ]

        if hint:
            lines.extend(['', hint])

        return '\n'.join(lines)

    def extract_relevant_output(self, expected, actual_output):
        expected_clean = expected.strip()
        actual_output_clean = actual_output.strip()

        expected_words = expected_clean.split()
        actual_words = actual_output_clean.split()

        matcher = difflib.SequenceMatcher(None, expected_words, actual_words)
        matching_ratio = matcher.ratio()
        opcodes = matcher.get_opcodes()

        if matching_ratio < 0.5:
            return None, None, matching_ratio

        for tag, i1, i2, j1, j2 in opcodes:
            if tag != 'equal':
                expected_start_idx = max(0, i1 - 1)
                expected_end_idx = min(len(expected_words), i2 + 1)
                actual_start_idx = max(0, j1 - 1)
                actual_end_idx = min(len(actual_words), j2 + 1)

                expected_snippet = ' '.join(expected_words[expected_start_idx:expected_end_idx])
                actual_snippet = ' '.join(actual_words[actual_start_idx:actual_end_idx])

                return expected_snippet, actual_snippet, matching_ratio

        return expected_clean, actual_output_clean, matching_ratio

    def describe_difference(self, expected, actual_output):
        matcher = difflib.SequenceMatcher(None, expected, actual_output)

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                continue

            expected_piece = expected[i1:i2] or '[nothing]'
            actual_piece = actual_output[j1:j2] or '[nothing]'

            if tag == 'delete':
                return f"Missing from your output: {expected_piece!r}"

            if tag == 'insert':
                return f"Extra text in your output: {actual_piece!r}"

            return f"Difference near this part: expected {expected_piece!r} but got {actual_piece!r}"

        return ''

    def check_template_usage(self):
        required_line = '# DO NOT DELETE THIS LINE - used by auto grader'
        if required_line not in student_source:
            print(
                '\n⚠️ WARNING ⚠️ - You are not using the provided template. '
                'This could cause problems on future assignments. See instructions in Blackboard.\n'
            )


if __name__ == '__main__':
    unittest.main()

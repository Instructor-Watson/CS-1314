
"""
    Complete the TODOs below.
    Do not define anything in the global scope except other functions (not needed for this assignment).
    From this point forward, we will stick to local scope (inside functions).

    Helpful Notes~
        Character classes:
        [a-z]    any lowercase letter, "lower only"
        [A-Z]    any uppercase letter, "upper only"
        [a-zA-Z] any lower or uppercase letter, "upper or lower"
        \d       any numeric digit from 0 to 9, "is digit"
        \D       any character that is not a numeric digit from 0 to 9. "not digit"
        \w       any letter, numeric digit, or the underscore character. "words"
        \W       any character that is not a letter, numeric digit, or the underscore character. "not word"
        \s       any space, tab, or newline character. "whitespace"
        \S       any character that is not a space, tab, or newline "not whitespace"

        Quantifiers:
        * matches zero or more occurrences
        + matches one or more occurrences
        ? matches zero or one occurence

        If you want to detect these characters as part of your text pattern,
        you need to escape them with a backslash:
        \.  \^  \$  \*  \+  \?  \{  \}  \[  \]  \\  \|  \(  \)


"""

"""
    TODO finish the get_email function.
    The text parameter will be a string that could have characters before or after the email.
    You want to extract the email from the string and return it.
    You will only ever have one email in the input.
    HINT: use the search method to find the email and the group method to get the characters that matched.
    It doesn't matter if you use re.compile or not for this assignment.

    For this assignment, an email address is:
       a string that could include "a-z", "A-Z", "." (at least one of these)
       followed by an "@" symbol
       followed by more characters that could include "a-z", "A-Z", "." (at least one of these)
       followed by a single "."
       followed by at least 2 letters "A-Z" "a-z"

    Example input: Hi my email is jason@example.com, thank you!
    Example return: jason@example.com

    Example input: Sorry I don't have an email.
    Example return: No email found

    Example input: my email is badEmail@example.c
    Examle return: No email found

    Example input: my email is badEmail!@example.com
    Examle return: No email found
"""
import re

def get_email(text):
    #TODO return the email if there is one, otherwise return "No email found"

#DO NOT CHANGE MAIN
def main():
    userInput = input("Where should I send my email?")
    result = get_email(userInput)
    print(result)

if __name__ == "__main__":
    main()

# DO NOT DELETE THIS LINE - used by auto grader
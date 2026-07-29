
"""
    Isn't it nice that you can have multiline strings if you use triple quotes?
    Sometimes people will put their comments in quotes like this instead of using #
    There is nothing wrong with doing that and it makes the comments pop.

    Complete the TODOs below.
    Do not define anything in the global scope except other functions (not needed for this assignment).
    From this point forward, we will stick to local scope (inside functions).
"""

def main():

    # You can use the escape character to continue code on the next line! pretty nice right!
    # The only reason to do this is to make the paragraph look nicer.
    paragraph = \
        """
        In the tranquil heart of the verdant forest, where sunlight dapples through the ancient canopy and
        the air hums with the melody of nature, there thrives a hidden grove. Within this secluded haven,
        rare flowers bloom with vibrant hues, and wildlife roams free, unburdened by the encroachments of civilization.
        Among these natural wonders, a particular stream meanders, its waters clear as crystal and cool to the touch,
        whispering secrets of the untamed wilderness to those who pause to listen.
        """

    """
    TODO print the following string using escape characters: Sam's favorite quote is "Live long and prosper"
    """
    #your code here :]

    """
    TODO Use string slicing and concatenation to create a new string from myString.
         your new string should be: Pythoning
         You must use slicing and concatenation to create the string. Do not add any additional character values.
         print the result
    """
    myString = "Python is amazing"
    #your code here :]

    """
    TODO Convert the case of the variable motto to all upper case using the upper() method.
         print the result
         ----------------------------
         Note that you could do the opposite with the lower() method.
         These methods are useful for input validation because you can convert user input to lower or upper and check a single value
         for example, if you are asking the user Yes or No: Yes, YES, YEs, yES, etc are all different values. if you convert the
         input to all lower or upper, then it makes it much easier to check if their value is semantically correct.
         i.e. "YES".lower() == "yes"   "YeS".lower() == "yes" "Yes".lower() == "yes" so we avoid issues like: "YES" != "yes"  "YeS" != "yes" "Yes" != "yes"
         ----------------------------
    """
    motto = "go rams!"
    #your code here :]

    """
    TODO Use the replace() method to modify the variable sentence replacing fun with Awesome
         print the result
    """
    sentence = "Learning Python is fun!"
    #your code here :]

    """
    TODO Use the strip() method to remove whitespace characters from the variable badInput
         print the result
    """
    badInput = "    I like to add spaces before my input because I want to break things"
    # your code here :]

    """
    TODO complete the input validation below to ensure the user provides a numeric value.
         print the numeric value using a f-string.
         For example if the user entered 47, then the exact output should be: Great job! 47 is a numeric value
         -------------------------------
         consider the isX() methods mentioned in the book.
         -------------------------------
    """
    userInput = 'believeInYourself'
    # fix the while condition
    while not userInput.isalpha():
        userInput = input("Please enter a numeric value:\n")
    # your code here :]


#as mentioned previously in other assignments, only run main() if we are running this code. don't run if we are importing this code into another file.
if __name__ == "__main__":
    main()


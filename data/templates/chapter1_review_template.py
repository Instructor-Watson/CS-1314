
#Name:

#TODO: complete each of the TODO tasks in this program. Do not modify code unless you are instructed to.

# Returns the sum of a + b
def add_nums(a, b):
    return a + b

# Returns the difference of a - b
def subtract_nums(a, b):
    return a - b

# Returns the quotient of a / b
def divide_nums(a, b):
    return a / b

# Returns the floored quotient (ie whole number) of a / b
def divide_nums_floored(a, b):
    return a // b

# Returns the product of a and b
def multiply_nums(a, b):
    return a * b

# Returns the modulus/remainder of a % b
def mod_nums(a, b):
    return a % b

# Returns the power of base 'a' with an exponent of 'b'
def power_nums(a, b):
    return a ** b

def start_testing():
    userA = #TODO get user input using 'input' and convert to an int using 'int'
    userB = #TODO get user input using 'input' and convert to an int using 'int'

    # this example is provided to show you how the rest should be completed.
    print(f"The sum of {userA} + {userB} is {add_nums(userA, userB)}")

    # TODO: as shown in the example above, complete the below tasks to complete the code.
    print(f"The difference of {userA} - {userB} is {#TODO call the correct function here }")
    print(f"The quotient of {userA} / {userB} is {#TODO call the correct function here }")
    print(f"The floored quotient of {userA} / {userB} is {#TODO call the correct function here }")
    print(f"The product of {userA} * {userB} is {#TODO call the correct function here }")
    print(f"The remainder of {userA} / {userB} is {#TODO call the correct function here }")
    print(f"The power of {userA} ** {userB} is {#TODO call the correct function here }")

# The below condition is only true if you are running the program. If you import this code into another
# program using 'import', this condition would not be true. This is a nice safe-guard to prevent
# testing code from running if you want to import this python file into another program in the future
# so you can use the functions defined in it in another program.
# In some of our previous examples, we called main() here. The idea there is to have all of the code for testing
# in a function called 'main' that is only called by default when the program is ran directly. Having all the code in
# a 'main' function would allow you to call 'main' from another program and run your test code. This might not make complete sense
# yet, but it will! Think for example, if this file had a series of functions related to a game. Then in the 'main' function,
# you start the game. If you are running this script directly, you want the game to start. If you importing this file into
# another program, you want to start the game when you are ready. This gives the programmer control over when 'main' is called.
# keep in mind that 'main' is an arbitrary name and you could use any name. To illustrate this, we use the function name start_testing.
if __name__ == "__main__":
    #this code only runs when you run the script directly, it doesn't run when you import this file into another program
    start_testing()

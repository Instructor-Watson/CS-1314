#Name:

#TODO complete each of the tasks listed below. The TODO tasks are in order so you can see how the code naturally runs.

# This program calculates the square of a number provided by the user.

def get_input():
    while True:  # This loop will continue until a valid input is provided and you return a value.
        try:
            #TODO Step 2: Prompt the user for input by using input(). Store the input in a variable.
            # Hint: Ensure the prompt asks for a number.
            #Replace this comment with your code.

            #TODO Step 3: Try to convert the user input to a float
            #Replace this comment with your code.

            #TODO Step 4: If the conversion is successful, return the float value.
            #Remeber that returning a value will automatically break you out of the while loop and return to where the function was called.
            #Replace this comment with your code.

        # This will catch cases where the input is not a valid number.
        except ValueError:
            # Step 5: If a ValueError is raised, print an error message asking for a valid number.
            # This block executes if the conversion in Step 3 fails.
            # Replace this comment with your code.

#TODO Step 1: Get a valid floating-point value from the user with the get_input function and store it in a variable.
# Replace this comment with your code.

#TODO Step 6: Now that you have a valid floating-point value, raise this value to the power of 2 and store it in a new varaible.
# Replace this comment with your code.

#TODO Step 7: Print out the value stored in your variables.
#For example, if the value returned from get_input is 5.0 and the result of step 6 is 25.0:
#The square of 5.0 is 25.0.
# Replace this comment with your code.

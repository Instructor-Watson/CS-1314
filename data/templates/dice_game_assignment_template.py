"""
ASSIGNMENT: THE LUCKY DICE SIMULATOR

Objective:
Write a program that keeps asking the user to roll a dice until they roll a 6.

Instructions:
1. Import the 'random' module. ~ already provided below
2. Create an infinite loop using 'while True'.
3. Ask the user to type 'roll' or 'done'.
4. If they type 'done', break the loop.
5. If they type anything other than 'roll' or 'done', restart the loop.
6. If they type 'roll', print "Rolling..." 3 times using a 'for' loop.
7. Generate a random number between 1 and 6.
8. If they roll a 6, tell them they won and break the loop.
"""

# Import the 'random' module
import random
# DO NOT CHANGE the next line of code. I use this special function so your "random" numbers are predictable for grading purposes.
# Once you submit the assignment, you can modify the seed value to see how different seeds provide different random values.
# If you deleted this line of code, you would get different random numbers each time you run the program
random.seed(1314)

print("Welcome to the Dice Simulator!")

# This starts the infinite loop
while True:
    # TODO: Use input() ~ covered in chapter 1 ~ to prompt the user with this exact text: "Type 'roll' to play or 'done' to exit: "
    # Save their answer in a variable (e.g., 'response')
    response = # your input code should go here

    # TODO: Check if the 'response' is equal to 'done'
    # If it is, use the 'break' statement to exit the loop.
    # Hint: if response == 'done': ...


    # TODO: Check if the 'response' is NOT equal to 'roll' ~ covered in chapter 2
    # If it's not 'roll', print "Invalid command. Please try again."
    # Then use the 'continue' statement to jump back to the start of the loop.
    # Hint: Use the != operator for "not equal".


    # TODO: Create a 'for' loop that uses range() to run 3 times. ~ covered in chapter 3
    # Inside the loop, print "Rolling..."
    # Hint: for i in range(3):
    
    
    # TODO: Generate a random number between 1 and 6 using random.randint() ~ covered in chapter 3
    # Save it in a variable called 'number'
    # Hint: random.randint(1, 6)
    
    
    # TODO: Print "You rolled a " followed by the number. 
    # Hint: You'll need to use str(number) to combine the number with the text string. ~ covered in chapter 1
    # Example: print("Text" + str(variable))


    # TODO: Check if 'number' is equal to 6.
    # If it is 6, print "You rolled a six! You win!"
    # Then use the 'break' statement to exit the loop.


# TODO: Print "Game Over" outside of the while loop block (another word for scope). ~ blocks are covered in chapter 2.
# This code should only run after the loop is broken (when the user wins).
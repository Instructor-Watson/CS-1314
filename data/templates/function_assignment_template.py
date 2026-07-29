
##
# Your name here
##

# Complete the program. the TODO comments are general guides to get you on the right track.

# Gets user input for an expense amount.
# Returns the expense amount or 'done' if the user is finished.
def get_expense_amount():
    # this while loop will keep "looping" until we return a value.
    while True:
        try:
            # TODO: update the input function below to ask the user to enter a expense amount or 'done'.
            expense_input = input("")

            # .lower() changes the string to all lower case, so even if the user types "DONE",
            # this makes the if statement case insensitive.
            # TODO: complete if statement to check if the user provided input is 'done'
            if expense_input.lower() == '':
                return 'done' # the function returns 'done' if that is what the user typed

            # by default input returns a string. Convert the user input from string to floating-point.
            # TODO: use the float() function to convert expense_amount to a floating-point number 
            #       and assign the result back to expense_amount
            expense_amount = # your code here

            # If the user gave a value less than 0, have them enter a new number
            if expense_amount < 0:
                print("Please enter a valid number for the expense.")
                continue

            #if we make it to this point, the expense_amount is greater than 0 and is a valid number.
            return expense_amount
        #If the user types something like "twenty" in for expense_amount, we get a value error on line 9
        #this except will catch that error so our program doesn't fail.
        except ValueError:
            print("Please enter a valid number for the expense.")    

# Gets user input for an expense description.
# Returns the description of the expense.
def get_expense_description():
    # TODO: Write code to get the expense description input
    # no input validation needed.


# Function to add an expense to the total and returns the new total
def add_expense(amount, total):
    # TODO: Write code to add the expense to the total and return new total


# Function to display the total expenses
def display_total(total):
    # TODO: Write code to display the total expenses
    ##      Hint: use string interpolation in print. print(f'some words or characters {variable_name}')
    ##      For example: Total Expenses: $10.52


# Main function to run the Personal Expense Tracker program
def main():
    total_expenses = 0
    while True:
        # TODO: Get expense amount using get_expense_amount function
        # TODO: Break the loop if the user is done entering expenses. 
        #       HINT: Check if the returned amount from get_expense_amount is 'done'
        # TODO: Get the expense description using get_expense_description function
        # TODO: Add the expense to the total using add_expense function
        # TODO: Display the total expenses using display_total function

        
    #DO NOT CHANGE THIS CODE OR YOU WILL BREAK AUTO GRADER
    print(f"\nFinal Total Expenses: ${total_expenses:.2f}")

# Ensure that the main() function only runs when the script is executed directly
# (and not when it's imported as a module in another script)
if __name__ == "__main__":
    main()
# DO NOT DELETE THIS LINE - used by auto grader
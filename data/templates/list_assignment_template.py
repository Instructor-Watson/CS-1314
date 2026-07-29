# your name

#Look for TODO items and complete them.

# Function to get user input for an expense amount
# returns the expense amount or the string 'done'
def get_expense_amount():
    while True:
        try:
            expense_input = input("Expense amount (or 'done'): ")

            #.lower() changes the string to all lower case, so even if the user types "DONE",
            #this makes the if statement case insensitive.
            if expense_input.lower() == 'done':
                return 'done'

            #by default input returns a string. Convert the user input from string to floating-point.
            expense_amount = float(expense_input)

            #If the user gave a value less than 0, have them enter a new number
            if expense_amount < 0:
                print("Please enter a valid number for the expense.")
                continue

            #if we make it to this point, the expense_amount is greater than 0 and is a valid number.
            return expense_amount
        #If the user types something like "twenty" in for expense_amount, we get a value error on line 9
        #this except will catch that error so our program doesn't fail.
        except ValueError:
            print("Please enter a valid number for the expense.")

# Function to get user input for an expense description,
# if the user just presses enter with providing a value, we prompt them again.
# Returns the expense description as a string.
def get_expense_description():
    while True:
        desc = input("Description of expense: ")
        if desc != '':
            break
    return desc

# Function to add an expense to the total
def add_expense(amount, total):
    return total + amount

# Function to display the total expenses
def display_total(total):
    # f"" is a format string that allows us to insert variables in a string using {}
    #.2f tells print to only print the first 2 decimals in a float.
    print(f"Total Expenses: ${total:.2f}")

#TODO: Finish this function
#Function to display the top 3 expense amounts and their descriptions
# expenses_amt is a list variable containing all of the expense amounts
# expenses_desc is a list variable containing all of the expense descriptions.
# return a list of tuples containing the top 3 expenses with expense amount first and the description second.
# for example, return [(expense, desc), (expense2, desc2), etc...]
def get_top_expenses(expenses_amt, expenses_desc):
    expense1 = 0 # the highest expense
    expense1_desc = '' # description for highest expense
    expense2 = 0 # the second highest expense
    expense2_desc = '' # description for second highest expense
    expense3 = 0 # the third highest expense
    expense3_desc = '' # description for third highest expense
    #TODO: Loop over the expenses_amt list and find the top 3 expenses.
    #HINT: I talk about how you could do this in a video.
    #Insead of storing the index, like I talked about in the video.
    #go ahead and get the description from the expenses_desc list and save it a variable
    #while you know the index of the expense you found. I think that makes more sense
    #than saving the index and getting the description later like we did in the video.
    #either way will work fine. I set you up above to go ahead and get the desc. Change it if you want.    

# Main function to run the Personal Expense Tracker program
def main():
    total_expenses = 0
    expenses_amt = [] # an empty list for expense amounts
    expenses_desc = [] # an empty list for expense desecriptions.
    while True:
        amount = get_expense_amount()
        if amount == 'done':
            break
        # TODO: append the expense amount to expenses_amt.
        description = get_expense_description()
        # TODO: append the expense description to expenses_desc.
        total_expenses = add_expense(amount, total_expenses)
        print(f"Added: ${amount} for {description}")

    #DO NOT CHANGE
    display_total(total_expenses)
    top_expenses = get_top_expenses(expenses_amt, expenses_desc)
    print(f"Top {len(top_expenses)} Expenses")
    for i in range(len(top_expenses)):
        print(f"{i+1}. ${top_expenses[i][0]:.2f} - {top_expenses[i][1]}")



# Example Usage
if __name__ == "__main__":
    main()

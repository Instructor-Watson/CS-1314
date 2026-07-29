"""
ASSIGNMENT: Debugging and Logging - Data Validation Demo

Overview:
In this assignment, you will simulate a "Data Validator" that checks if a hardcoded value is valid.
This demonstrates how try/except blocks help programs handle errors gracefully (like invalid data)
without crashing, while using logging to keep a record of what went wrong.

Requirements:
1. Implement logging:
    - Configure the logging module to write to a text file (e.g., 'app.log').
    - Use at least two different logging levels (e.g., INFO, ERROR).
2. Exception Handling:
    - Create a try/except block.
    - Inside the 'try' block, check if the data is invalid.
    - If invalid, intentionally raise a ValueError.
    - Catch and handle the exception in the 'except' block.
"""

# TODO: Import the 'logging' module


# TODO: Configure the logging system
# You must specify a 'filename' to write to, a 'level', and a format.

print("--- Data Validation Program Started ---")

# Simulation: We have a variable that represents a user's age or a balance.
# We have hardcoded an invalid negative value to force an error for this demo.
data_value = -50 

try:
    print(f"Checking value: {data_value}...")
    
    # TODO: Check if 'data_value' is less than 0.
    # If it is, intentionally RAISE a ValueError with a message like "Invalid data: Value cannot be negative".
    
    
    print("Data is valid!") # This line should only run if no exception is raised.

except ValueError as e:
    # TODO: Handle the exception.
    # 1. Log an error message using logging.error(). Include the exception message 'e'.
    # Hint: logging.error(f"Validation failed: {e}")
    print("Error: Invalid data detected. Checked logs for details.")

# TODO: Add a final log message using a DIFFERENT logging level (like INFO or WARNING)
# to show the program finished successfully even though an error was caught.


print("--- Program Finished ---")
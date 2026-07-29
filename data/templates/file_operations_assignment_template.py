"""
Overview:
In this assignment, you will practice working with files and directories using Python's
built-in 'pathlib' module and standard file input/output functions.

Requirements:
You must write code that utilizes ALL of the following functions:
1. pathlib.Path.is_file() - Check if a specific file exists.
2. pathlib.Path.mkdir()   - Create a new directory.
3. pathlib.Path.glob()    - List files in a directory matching a pattern.
4. open()                 - Open a file for reading or writing.
5. write()                - Write text to a file.
6. read()                 - Read text from a file.
"""

from pathlib import Path

# ==========================================
# Part 1: Pathlib Basics (is_file, mkdir)
# ==========================================

# TODO: Define a Path object for a filename (e.g., "my_test_file.txt")


# TODO: Use the .is_file() method to check if the file already exists.
# If it does NOT exist, print a message saying so.



# TODO: Define a Path object for a new directory name (e.g., "my_test_dir")


# TODO: Use the .mkdir() method to create this directory.
# You might want to check if it exists first (using .exists() or .is_dir()) to avoid errors.



# ==========================================
# Part 2: File I/O (open, write, read)
# ==========================================

print("--- Writing to file ---")

# TODO: Use the built-in open() function with mode "w" (write) to create/open the file.
# Inside the 'with' block, use the .write() method to add some text to the file.



print("--- Reading from file ---")

# TODO: Use the built-in open() function with mode "r" (read) to open the file again.
# Inside the 'with' block, use the .read() method to get the content and print it.



# ==========================================
# Part 3: Listing Files (glob)
# ==========================================

print("--- Listing files in current directory ---")

# TODO: Use the .glob() method on a Path object (like Path(".")) to find all files ("*").
# Loop through the results and print each file name.

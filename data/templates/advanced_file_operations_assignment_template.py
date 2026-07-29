"""
ASSIGNMENT: Advanced File Operations

Overview:
In this assignment, you will practice organizing files using Python's 'shutil', 'os', and 'zipfile' modules.
You must implement AT LEAST THREE (3) of the following operations:
1. Move or rename a file (shutil.move)
2. Copy a file (shutil.copy)
3. Copy a directory (shutil.copytree)
4. Walk through a directory tree (os.walk)
5. Create a ZIP file (zipfile.ZipFile.write)
6. Extract a ZIP file (zipfile.ZipFile.extractall)

Note: You do not need to do all of them. Pick 3!
"""

import shutil
import os
import zipfile

# Setup: Let's make sure we have a dummy file to work with.
# You don't need to change this part, but you can if you want to :)
if not os.path.exists("test_file.txt"):
    with open("test_file.txt", "w") as f:
        f.write("This is a test file for the assignment.")

test_file_name = "test_file_.txt"


print("--- Starting Assignment ---")

# ==========================================
# Copying or Moving Files
# ==========================================

# TODO (Optional): Use shutil.copy() to make a backup of 'test_file.txt'


# TODO (Optional): Use shutil.move() to rename 'test_file.txt' to 'renamed_file.txt'


# ==========================================
# Working with ZIP Files
# ==========================================

# TODO (Optional): Create a new ZIP file called 'my_archive.zip'


# TODO (Optional): Extract an existing ZIP file.


# ==========================================
# Advanced Directory Operations
# ==========================================

# TODO (Optional): Use os.walk() to list all files in the current directory.


# TODO (Optional): Copy an entire folder using shutil.copytree()
# (Make sure the source folder exists first!)


print("--- Assignment Complete ---")
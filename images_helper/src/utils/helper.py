import os
import shutil
import re


def getFilename(imagePath):
    match = re.search(r'([^/]+)(?=\.\w+$)', imagePath)
    if match:
        return match.group(1)
    return None

def isFileExists(filePath): 
    return os.path.isfile(filePath)
    
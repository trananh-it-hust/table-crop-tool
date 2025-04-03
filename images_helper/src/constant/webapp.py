import os



_currentFolderPath=os.path.dirname(os.path.abspath(__file__))

PUBLIC_FOLDER= os.path.abspath(os.path.join(_currentFolderPath,'..','public'))

EXTRACT_ROOM_IMAGE_PATH=f"{PUBLIC_FOLDER}/out"
PUBLIC_DATA_PATH=f"{PUBLIC_FOLDER}/data"
CROPPED_TABLE_IMAGE_PATH=f"{EXTRACT_ROOM_IMAGE_PATH}/cropped"
EXTRACT_IGNORE=['cropped','originalImage.png','dataGroup.json']

AWS_READ_IMAGE_JSON="awsReadImage.json"
READ_IMAGE_ORIGINAL_JPG="originalImage.png"

SIMILARITY=0.92
import json
from flask import jsonify, send_from_directory, request
from pdf2image import convert_from_path
import os
from constant.webapp import PUBLIC_FOLDER, EXTRACT_ROOM_IMAGE_PATH
import datetime

def getImage(subpath):
    return send_from_directory(f"{PUBLIC_FOLDER}", subpath)

def uploadImageHandle():
    date = datetime.datetime.now().strftime("%Y%m%d%H")
    
    file = request.files['file']
    file_type = request.form['type']
    name_hotel = request.form['nameHotel']
    
    image_paths = []  

    if file_type == 'image':
        file_path = f"{EXTRACT_ROOM_IMAGE_PATH}/{name_hotel}_{date}.png"
        file.save(file_path)
        image_paths.append(f"out/{name_hotel}_{date}.png")
    else:  
        pdf_path = f"{EXTRACT_ROOM_IMAGE_PATH}/{name_hotel}_{date}.pdf"
        file.save(pdf_path)

        images = convert_from_path(pdf_path, dpi=300)
        for i, image in enumerate(images):
            image_path = f"{EXTRACT_ROOM_IMAGE_PATH}/{name_hotel}_{date}_{i + 1}.png"
            image.save(image_path, "PNG")
            image_paths.append(f"out/{name_hotel}_{date}_{i + 1}.png")

    return jsonify({"filePaths": image_paths}), 200

def getConfig(nameHotel):
    settings_file = f"{PUBLIC_FOLDER}/settingHotel.json"

    if os.path.exists(settings_file):
        with open(settings_file, 'r') as f:
            settings = json.load(f)
    else:
        settings = {}

    if nameHotel not in settings:
        settings[nameHotel] = {
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "cols": 30,
            "rows": 5
        }

        with open(settings_file, 'w') as f:
            json.dump(settings, f, indent=4)

    return jsonify(settings[nameHotel]), 200
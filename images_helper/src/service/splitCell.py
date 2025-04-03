from flask import jsonify, request
from concurrent.futures import ThreadPoolExecutor
from utils.awsSplitCell import crop_image_from_textract
from utils.manualSplitCell import splitCellsAwsManual
import logging


executor = ThreadPoolExecutor(max_workers=5)  # Chạy tối đa 5 luồng cùng lúc

def process_image(id):
    return crop_image_from_textract(id)

def splitCellsAws():
    try:
        data = request.get_json()
        if not data or 'ids' not in data:
            return jsonify({"error": "Missing 'ids' in request body"}), 400

        ids = data['ids']
        if not all(isinstance(id, str) for id in ids):
            return jsonify({"error": "All ids must be strings"}), 400

        with ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(process_image, ids))
        
        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def splitCells():
    try:
        data = request.get_json()
        if not data or 'ids' not in data:
            return jsonify({"error": "Missing 'ids' in request body"}), 400

        ids = data['ids']
        if not all(isinstance(id, str) for id in ids):
            return jsonify({"error": "All ids must be strings"}), 400
       
        config = data.get('config', {})
        nameHotel = data.get('nameHotel', None)
        if not nameHotel:
            return jsonify({"error": "Missing 'nameHotel' in request body"}), 400
        if not isinstance(config, dict):
            config = {}
        
        results = []
        for id in ids:
            result = splitCellsAwsManual(nameHotel, id, config)
            results.append(result)

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
import os
import json
import logging
import boto3
import cv2
from dotenv import load_dotenv
from constant.webapp import PUBLIC_FOLDER, PUBLIC_DATA_PATH
from utils.helper import getFilename

# Load biến môi trường từ file .env
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# Lấy thông tin AWS từ biến môi trường
AWS_ACCESS_KEY_ID = os.getenv('ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('YOUR_SECRET_KEY')
REGION_NAME = "ap-northeast-2"

# Đường dẫn thư mục public
data_path = os.path.abspath(PUBLIC_DATA_PATH)
public_folder = os.path.abspath(PUBLIC_FOLDER)

# Kiểm tra nếu thiếu thông tin AWS
if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    logging.error("⚠️ Thiếu thông tin AWS_ACCESS_KEY_ID hoặc AWS_SECRET_ACCESS_KEY trong biến môi trường.")
    raise ValueError("AWS credentials are not set in environment variables.")

def data_from_textract(image_path):
    try:
        if not os.path.exists(image_path):
            logging.error(f"❌ Ảnh không tồn tại: {image_path}")
            return None

        # Tạo đường dẫn lưu kết quả
        result_path = os.path.join(data_path, f"aws_{os.path.basename(image_path)}.json")

        # Nếu file kết quả đã tồn tại, không cần chạy lại
        if os.path.exists(result_path):
            logging.info(f"✅ Kết quả đã tồn tại: {result_path}")
            return result_path

        # Tạo client Textract
        textract = boto3.client(
            "textract",
            region_name=REGION_NAME,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )

        # Đọc ảnh và gửi yêu cầu lên Textract
        with open(image_path, 'rb') as image:
            response = textract.analyze_document(
                Document={'Bytes': image.read()},
                FeatureTypes=['TABLES']
            )

        if "Blocks" not in response:
            logging.error("⚠️ Textract không trả về dữ liệu hợp lệ.")
            return None

        # Lưu kết quả vào file JSON
        os.makedirs(os.path.dirname(result_path), exist_ok=True)
        with open(result_path, 'w', encoding='utf-8') as file:
            json.dump(response, file, indent=4, ensure_ascii=False)

        logging.info(f"✅ Kết quả đã lưu tại: {result_path}")
        return result_path

    except Exception as e:
        logging.error(f"❌ Lỗi khi xử lý với Textract: {e}")
        return None

def crop_image_from_textract(image_path):
    try:
        # Đường dẫn đầy đủ của ảnh
        old = image_path
        image_path = os.path.join(public_folder, image_path)

        if not os.path.exists(image_path):
            logging.error(f"❌ Không tìm thấy ảnh: {image_path}")
            return None

        # Gọi Textract để lấy dữ liệu
        result_path = data_from_textract(image_path)
        if not result_path:
            print("❌ Không thể lấy dữ liệu từ Textract.")
            return None

        # Đọc ảnh bằng OpenCV
        image = cv2.imread(image_path)
        if image is None:
            logging.error(f"❌ Không thể đọc ảnh: {image_path}")
            return None

        height, width, _ = image.shape  
        s = height * width

        # Đọc dữ liệu từ file JSON
        with open(result_path, 'r', encoding='utf-8') as file:
            textract_data = json.load(file)

        blocks = textract_data.get("Blocks", [])
        cells = []
        group_columns = {}
        group_rows = {}

        def get_group_columns(x):
            for key, value in group_columns.items():
                if abs(x - key) < 5:
                    return value
            return None

        def get_group_rows(y):
            for key, value in group_rows.items():
                if abs(y - key) < 5:
                    return value
            return None

        result = []
        
        # Tạo thư mục lưu ảnh cắt
        
        path_cropped = f"{public_folder}/data/cropped/{getFilename(image_path)}"
        if not os.path.exists(path_cropped):
            os.makedirs(path_cropped)
        for block in blocks:
            if block["BlockType"] == "CELL":
                bbox = block["Geometry"]["BoundingBox"]

                x = int(bbox["Left"] * width)
                y = int(bbox["Top"] * height)
                w = int(bbox["Width"] * width)
                h = int(bbox["Height"] * height)

                if w * h > s / 4:
                    continue
                if w > 0.05 * width or h > 0.5 * height:
                    continue

                cells.append((x, y, w, h))
                
                cropped = image[y:y+h, x:x+w]
                cell_path = f"{path_cropped}/{x}_{y}.png"
                cv2.imwrite(cell_path, cropped)
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 1)
                group_column = get_group_columns(x)
                group_row = get_group_rows(y)
                if group_column is None:
                    group_columns[x] = len(group_columns)
                if group_row is None:
                    group_rows[y] = len(group_rows)
                result.append({
                    "group_column": get_group_columns(x),
                    "group_row": get_group_rows(y),
                    "x": x,
                    "y": y,
                    "w": w,
                    "h": h,
                    "path": f"data/cropped/{getFilename(image_path)}/{x}_{y}.png"
                })
        
        for cells in result:
            x, y, w, h = cells["x"], cells["y"], cells["w"], cells["h"]
            cv2.rectangle(image, (x, y), (x + w, y + h), (250, 100, 100), 2)
        cv2.imwrite(f"{path_cropped}/result.png", image)
        
        logging.info("✅ Xử lý hoàn tất.")
        return {
            "image": f"data/cropped/{getFilename(image_path)}/result.png",
            "cells": result
        }
        
    except Exception as e:
        logging.error(f"❌ Lỗi trong quá trình xử lý ảnh: {e}")
        return None

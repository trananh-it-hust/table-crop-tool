import os
import json
import cv2
import logging
import numpy as np
from constant.webapp import PUBLIC_DATA_PATH, PUBLIC_FOLDER
from utils.helper import getFilename


public_folder = os.path.abspath(PUBLIC_FOLDER)

def splitCellsAwsManual(nameHotel, image_path, config):
    try:
        path_cropped = f"{public_folder}/data/croppedManual/{getFilename(image_path)}"

        image_path = os.path.join(public_folder, image_path)
        
        if not os.path.exists(path_cropped):
                os.makedirs(path_cropped)
                
        if not os.path.exists(image_path):
                logging.error(f"❌ Không tìm thấy ảnh: {image_path}")
                return None
        # Đọc dữ liệu từ settingHotel.json
        with open(f"{PUBLIC_FOLDER}/settingHotel.json", 'r') as f:
            settings = json.load(f)
        logging.info(f"📄 Đọc cấu hình từ settingHotel.json")
        # Lấy giá trị mặc định nếu không có trong config
        configDefault = settings.get(nameHotel, {})
        x = config.get("x", configDefault.get("x", 0))
        y = config.get("y", configDefault.get("y", 0))
        width = config.get("width", configDefault.get("width", 0))
        height = config.get("height", configDefault.get("height", 0))
        cols = config.get("cols", configDefault.get("cols", 1))
        rows = config.get("rows", configDefault.get("rows", 1))
        # Ép kiểu
        x = int(x)
        y = int(y)
        width = int(width)
        height = int(height)
        cols = int(cols)
        rows = int(rows)
        # Cập nhật lại settingHotel.json
        config = {
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "cols": cols,
            "rows": rows
        }
        settings[nameHotel] = config
        with open(f"{PUBLIC_FOLDER}/settingHotel.json", 'w') as f:
            json.dump(settings, f, indent=4)
        
        # Đọc ảnh đầu vào
        image = cv2.imread(image_path)
        logging.info(f"🖼 Đọc ảnh: {image_path}")
        
        # Cắt ảnh theo vùng quan tâm
        image = image[y:y+height, x:x+width]
        # Cập nhật lại width và height sau khi ignore
        height, width, _ = image.shape
        logging.info(f"📏 Kích thước ảnh sau khi cắt: {width} (width), {height} (height)")
        # Tính kích thước của mỗi ô (lấy kết quả là số thực)
        cell_width = width // cols
        cell_height = height // rows
        if width%cols > cell_width//2:
            cell_width += 1
        logging.info(f"📏 Kích thước ô: {cell_width} (width), {cell_height} (height)")
        result = []
        logging.info(f"🔢 Số cột: {cols}, Số dòng: {rows}")
        # Cắt ảnh theo rows và cols
        try:
            for row in range(rows):
                for col in range(cols):
                    x_start = col * cell_width
                    y_start = row * cell_height
                    x_end = (col + 1) * cell_width
                    y_end = (row + 1) * cell_height

                    cell = image[int(y_start):int(y_end), int(x_start):int(x_end)]
                    output_filename = f"{path_cropped}/{row}_{col}.png"
                    cv2.imwrite(output_filename, cell)
                    
                    result.append({
                        "group_column": col,
                        "group_row": row,
                        "x": x_start,
                        "y": y_start,
                        "w": cell_width,
                        "h": cell_height,
                        "path": f"data/croppedManual/{getFilename(image_path)}/{row}_{col}.png"
                    })
        except Exception as e:
            logging.error(f"❌ Lỗi trong quá trình cắt ảnh: {e}")
        try:
            for cells in result:
                x, y, w, h = cells["x"], cells["y"], cells["w"], cells["h"]
                cv2.rectangle(image, (x, y), (x + w, y + h), (250, 100, 100), 2)
            cv2.imwrite(f"{path_cropped}/result.png", image)
        except Exception as e:
            logging.error(f"❌ Lỗi trong quá trình vẽ hình chữ nhật: {e}")
        logging.info("✅ Xử lý hoàn tất.")
        return {
            "image": f"data/croppedManual/{getFilename(image_path)}/result.png",
            "cells": result
        }
    
    except Exception as e:
        logging.error(f"❌ Lỗi trong quá trình xử lý ảnh: {e}")
        return None

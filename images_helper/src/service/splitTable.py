import cv2
import os
from constant.webapp import PUBLIC_FOLDER, CROPPED_TABLE_IMAGE_PATH
from flask import jsonify, request

# Biến toàn cục để đảm bảo index không bị reset
global_index = 0  

def excTableByImage(imagePath):
    global global_index  # Dùng biến toàn cục
    
    filename = os.path.basename(imagePath)
    filename = os.path.splitext(filename)[0]
    img = cv2.imread(imagePath)
    # Chuyển sang grayscale
    grayImage = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Áp dụng Adaptive Threshold để làm nổi bật bảng
    thresh = cv2.adaptiveThreshold(
        grayImage, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )

    # Tìm contours của bảng
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Xử lý từng bảng cắt được
    s = img.shape[0] * img.shape[1]  # Kích thước ảnh gốc
    table_images = []
    tables = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)  # Lấy tọa độ hình chữ nhật bao quanh bảng
        s_cnt = w * h
        if s_cnt < 0.05 * s or s_cnt > 0.97 * s:
            continue
        tables.append((x, y, w, h))
    # sắp xếp y theo giảm dần
    tables.sort(key=lambda y: y[1], reverse=False)
    for i, table in enumerate(tables):
        x, y, w, h = table
        table_crop = img[y:y+h, x:x+w]
        global_index += 1
        table_path = f"{CROPPED_TABLE_IMAGE_PATH}/{filename}_{global_index}.png"
        cv2.imwrite(table_path, table_crop)
        table_images.append(f"out/cropped/{filename}_{global_index}.png")

    return table_images  # Trả về danh sách ảnh cắt được

def splitTable():
    global global_index
    global_index = 0
    filePaths = request.json.get('filePaths', [])
    result = []
    
    for filePath in filePaths:
        filePath = os.path.join(PUBLIC_FOLDER, filePath)
        tables = excTableByImage(filePath)  # Nhận danh sách file của từng ảnh đầu vào
        result.extend(tables)  # Thêm vào danh sách kết quả

    return jsonify({"filePaths": result}), 200

import os
import cv2
import numpy as np
import logging
from constant.webapp import PUBLIC_FOLDER
from flask import jsonify, request


classification = []

def histogram_similarity(image1_path, image2_path):
    img1 = cv2.imread(image1_path)
    img2 = cv2.imread(image2_path)

    # Chuyển ảnh sang HSV
    img1_hsv = cv2.cvtColor(img1, cv2.COLOR_BGR2HSV)
    img2_hsv = cv2.cvtColor(img2, cv2.COLOR_BGR2HSV)

    # Tính histogram
    hist1 = cv2.calcHist([img1_hsv], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
    hist2 = cv2.calcHist([img2_hsv], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])

    # Chuẩn hóa
    hist1 = cv2.normalize(hist1, hist1).flatten()
    hist2 = cv2.normalize(hist2, hist2).flatten()

    # So sánh bằng correlation (càng gần 1 càng giống)
    similarity = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
    return similarity

def classify_color(image):
    """Xác định màu sắc chủ đạo của ô bằng K-means clustering."""
    try :
        # Chuyển đổi ảnh sang HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Chuyển ảnh thành mảng 2D (số điểm ảnh x 3 kênh màu)
        pixels = hsv.reshape(-1, 3)
        
        # Áp dụng K-means clustering để tìm màu chủ đạo
        num_clusters = 3  # Số nhóm màu cần tìm
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        _, labels, centers = cv2.kmeans(np.float32(pixels), num_clusters, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Đếm số lượng điểm ảnh thuộc mỗi cluster
        unique, counts = np.unique(labels, return_counts=True)
        
        # Chọn cluster có nhiều điểm ảnh nhất làm màu chủ đạo
        dominant_index = unique[np.argmax(counts)]
        dominant_hsv = centers[dominant_index]
        
        h, s, v = dominant_hsv
        print(f"Dominant HSV: {h}, {s}, {v}")
        
        h = int(h)
        s = int(s)
        v = int(v)

        global classification
        
        for i in classification:
            if abs(i[0] - h) <= 3 and abs(i[1] - s) <= 20 and abs(i[2] - v) <= 20 and abs(i[1] - s) + abs(i[2] - v) <= 30:
                return f"{i[0]}_{i[1]}_{i[2]}"
        classification.append((h, s, v))
        return f"{h}_{s}_{v}"
    except:
        logging.error(f"❌ Lỗi trong quá trình xác định màu sắc chủ đạo.")
        return "0_0_0"

def getGroupCell():
    # Get all the images in the folder
    
    images = request.json.get("paths")
        
    global classification
    classification = []
    
    
    res = {}
    
    for image_path in images:
        image_path_ori = os.path.join(PUBLIC_FOLDER, image_path)
        # Đọc ảnh đầu vào
        try :
            image = cv2.imread(image_path_ori)
            
            # Xác định màu sắc chủ đạo của ô
            group = classify_color(image)
            res[group] = res.get(group, [])
            res[group].append(image_path)
        except:
            logging.error(f"❌ Lỗi trong quá trình xử lý ảnh: {image_path}")
    
    for key in list(res.keys()):  # Duyệt qua các keys của dictionary
        diff = []  
        original_image_path = os.path.join(PUBLIC_FOLDER, res[key][0]) 

        for image_path in list(res[key]):  # Duyệt danh sách ảnh
            image_path_ori = os.path.join(PUBLIC_FOLDER, image_path)
            similarity = histogram_similarity(original_image_path, image_path_ori)
            logging.info(f"Similarity between {res[key][0]} and {image_path}: {similarity}")

            if similarity < 0.98:
                diff.append(image_path)
                res[key].remove(image_path)

        if diff:
            new_key = key + "_diff"
            res[new_key] = diff


    
    return res
        
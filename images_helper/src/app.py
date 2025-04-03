from flask import Flask
from flask_cors import CORS
import os
from service import getImage, uploadImageHandle , getConfig 
from service.splitTable import splitTable
from service.splitCell import splitCellsAws,splitCells
from service.groupCell import getGroupCell

currentFolder=os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

@app.route('/public/<path:subpath>', methods=['GET'])
def getPublicImage(subpath):
    return getImage(subpath)

@app.route('/api/upload-img', methods=['POST'])
def postImageHandle():
    return uploadImageHandle()

@app.route('/api/split-table', methods=['POST'])
def postSplitTable():
    return splitTable()

@app.route('/api/split-cells-aws', methods=['POST'])
def postSplitCellsAws():
    return splitCellsAws()

@app.route('/api/split-cells', methods=['POST'])
def postSplitCells():
    return splitCells()

@app.route('/api/config/<nameHotel>', methods=['GET'])
def getConfigHotel(nameHotel):
    return getConfig(nameHotel)

@app.route('/api/group-cells', methods=['POST'])
def postGroupCells():
    return getGroupCell()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 4000))
    app.run(host='0.0.0.0', port=port, debug=True)




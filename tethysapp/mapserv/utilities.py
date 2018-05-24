import ee
import requests
import json
import numpy as np
import datetime,time
#ee.Initialize()

def get_image_metadata(image):
    metadata = {}
    eeImage = ee.Image(image)
    eeImageInfo = eeImage.getInfo()
    # bands = [[x['id'],x['data_type']['min'],x['data_type']['max']] for x in eeImageInfo['bands']]
    metadata["bandNames"] = [x['id'] for x in eeImageInfo['bands']]
    metadata["properties"] = [x for x in eeImageInfo['properties']]

    # metadata["bandInfo"] = [[x['id'],x['data_type']['min'],x['data_type']['max']] for x in eeImageInfo['bands']]

    # print eeImageInfo

    return metadata

def get_col_metadata(image):
    metadata = {}
    eeCollection = ee.ImageCollection(image)
    # print eeCollection.getInfo()
    dtRange = eeCollection.get('date_range').getInfo()
    startDate = time.strftime("%Y-%m-%d", time.gmtime(float(dtRange[0])/1000))
    endDate = time.strftime("%Y-%m-%d", time.gmtime(float(dtRange[1])/1000))

    eeImage = ee.Image(eeCollection.first())
    eeImageInfo = eeImage.getInfo()
    # bands = [[x['id'],x['data_type']['min'],x['data_type']['max']] for x in eeImageInfo['bands']]
    metadata["bandNames"] = [x['id'] for x in eeImageInfo['bands']]
    metadata["properties"] = [x for x in eeImageInfo['properties']]
    metadata["startDate"] = startDate
    metadata["endDate"] = endDate
    return metadata


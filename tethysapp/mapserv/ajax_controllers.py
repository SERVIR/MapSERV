from django.http import JsonResponse, HttpResponse, Http404
from django.shortcuts import render
from django.contrib.auth.decorators import login_required,user_passes_test
from django.views.decorators.csrf import csrf_exempt
from utilities import *
import json
import ee

#ee.Initialize()

def get_image(request):
    return_obj = {}
    if request.is_ajax() and request.method == 'POST':
        info = request.POST


        visParams = {}

        image = info.get('image')
        type = info.get('type')

        if type == 'img':
            eeImage = ee.Image(image)

            picker = info.get('picker')

            if picker == 'palette':

                visParams['min'] = info.get('min')
                visParams['max'] = info.get('max')
                # visParams["palette"] = ['00FFFF', '0000FF']
                visParams['bands'] = info.get('band')
                colors = info.get('colors')
                colors = json.loads(colors)
                palatte = ','.join(map(str, colors))
                visParams['palette'] = palatte
                mapId = eeImage.getMapId(visParams)


                return_obj["success"] = "success"
                return_obj["image"] = image
                return_obj["token"] = mapId['token']
                return_obj["imageid"] = mapId['mapid']

            if picker == 'gamma':
                visParams['min'] = info.get('min')
                visParams['max'] = info.get('max')
                # visParams["palette"] = ['00FFFF', '0000FF']

                band = info.get('band')
                band = json.loads(band)
                band = ','.join(map(str, band))
                visParams['bands'] = band
                gamma = info.get('gamma')

                if "," in gamma:
                    gamma = gamma.split(",")
                    gamma = ','.join(map(str, gamma))
                    visParams['gamma'] = gamma
                else:
                    visParams['gamma'] = float(gamma)

                mapId = eeImage.getMapId(visParams)

                return_obj["success"] = "success"
                return_obj["image"] = image
                return_obj["token"] = mapId['token']
                return_obj["imageid"] = mapId['mapid']

        if type=='imgcol':
            dateFrom = info.get('start')
            dateTo = info.get('end')
            eeCollection = ee.ImageCollection(image).filterDate(dateFrom,dateTo)

            picker = info.get('picker')

            if picker == 'gamma':
                band = info.get('band')
                band = json.loads(band)
                band = ','.join(map(str, band))
                visParams['bands'] = band
                visParams['min'] = info.get('min')
                visParams['max'] = info.get('max')

                gamma = info.get('gamma')

                if "," in gamma:
                    gamma = gamma.split(",")
                    gamma = ','.join(map(str, gamma))
                    visParams['gamma'] = gamma
                else:
                    visParams['gamma'] = float(gamma)


                mapId = eeCollection.getMapId(visParams)


                return_obj["success"] = "success"
                return_obj["image"] = image
                return_obj["token"] = mapId['token']
                return_obj["imageid"] = mapId['mapid']

            if picker == "palette":
                visParams['min'] = info.get('min')
                visParams['max'] = info.get('max')
                # visParams["palette"] = ['00FFFF', '0000FF']
                visParams['bands'] = info.get('band')
                colors = info.get('colors')
                colors = json.loads(colors)
                palette = ','.join(map(str, colors))
                visParams['palette'] = palette

                mapId = eeCollection.getMapId(visParams)

                return_obj["success"] = "success"
                return_obj["image"] = image
                return_obj["token"] = mapId['token']
                return_obj["imageid"] = mapId['mapid']


    return JsonResponse(return_obj)

def get_img_info(request):
    return_obj = {}
    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        image = info.get('image')
        type = info.get('type')

        if type == 'img':
            metadata = get_image_metadata(image)

            return_obj["success"] = "success"
            return_obj["image"] = image
            return_obj["metadata"] = metadata


        if type=='imgcol':
            eeCollection = ee.ImageCollection(image)
            eeCollectionInfo = eeCollection.getInfo()
            return_obj["success"] = "success"
            return_obj["image"] = image

    return JsonResponse(return_obj)

def get_col_info(request):
    return_obj = {}
    if request.is_ajax() and request.method == 'POST':
        info = request.POST

        image = info.get('image')
        type = info.get('type')

        if type=='imgcol':
            metadata = get_col_metadata(image)

            return_obj["success"] = "success"
            return_obj["image"] = image
            return_obj["metadata"] = metadata

    return JsonResponse(return_obj)
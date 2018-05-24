from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import *
from utilities import *
import time

def home(request):
    """
    Controller for the app home page.
    """

    today = time.strftime("%Y-%m-%d")
    image_type = SelectInput(display_text='Select Image Type',
                             name='image-type',
                             multiple=False,
                             options=[('Map ID and Token','mapid')],
                             # options=[('Image', 'img'), ('Image Collection', 'imgcol'), ('Map ID and Token', 'mapid')],
                             initial=['Map ID and Token'],
                             select2_options={'placeholder': 'Select Image Type',
                                              'allowClear': True})

    image_input = TextInput(display_text='Asset Name',
                            name='image-input',
                            placeholder='Enter a GEE Asset',
                            initial='MODIS/MYD13A1')

    mapid_input = TextInput(display_text='Map ID ',
                            name='mapid-input',
                            placeholder='Enter map id')

    maptoken_input = TextInput(display_text='Map Token ',
                            name='maptoken-input',
                            placeholder='Enter map token')

    display_input = TextInput(display_text='Display Name',
                            name='display-input',
                            placeholder='Enter a display name',
                            initial='MODIS Layer')

    min_input = TextInput(display_text='Minimum Value',
                            name='min-input',
                            placeholder='Enter a min value',
                            initial='0')

    max_input = TextInput(display_text='Maximum Value',
                          name='max-input',
                          placeholder='Enter a max value',
                          initial='0.8')

    gamma_input = TextInput(display_text='Gamma Value',
                          name='gamma-input',
                          placeholder='Enter a gamma corerction value',
                          initial='0.8')


    start_date = DatePicker(name='start-date',
                            display_text='Start Date',
                            autoclose=True,
                            format='yyyy-mm-dd',
                            start_view='decade',
                            start_date='1970-01-01',
                            today_button=True,
                            initial=today)

    end_date = DatePicker(name='end-date',
                          display_text='End Date',
                          autoclose=True,
                          format='yyyy-mm-dd',
                          start_view='decade',
                          start_date='1970-01-01',
                          today_button=True,
                          initial=today)

    context = {
        "image_input":image_input,
        "mapid_input":mapid_input,
        "maptoken_input":maptoken_input,
        "image_type":image_type,
        "start_date":start_date,
        "end_date":end_date,
        "min_input":min_input,
        "max_input":max_input,
        "gamma_input":gamma_input,
        "display_input":display_input
    }

    return render(request, 'mapserv/home.html', context)

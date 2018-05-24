from tethys_sdk.base import TethysAppBase, url_map_maker


class Mapserv(TethysAppBase):
    """
    Tethys app class for MapSERV.
    """

    name = 'MapSERV'
    index = 'mapserv:home'
    icon = 'mapserv/images/logo.png'
    package = 'mapserv'
    root_url = 'mapserv'
    color = '#2980b9'
    description = 'View Google Earth Engine layers for a given Map ID and Token'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='mapserv',
                controller='mapserv.controllers.home'
            ),
            UrlMap(
                name='get-image',
                url='mapserv/get-image',
                controller='mapserv.ajax_controllers.get_image'
            ),
            UrlMap(
                name='get-img-info',
                url='mapserv/get-img-info',
                controller='mapserv.ajax_controllers.get_img_info'
            ),
            UrlMap(
                name='get-col-info',
                url='mapserv/get-col-info',
                controller='mapserv.ajax_controllers.get_col_info'
            ),
        )

        return url_maps

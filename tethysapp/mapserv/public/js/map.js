/*****************************************************************************
 * FILE:    MapSERV Map
 * DATE:     24 MAY 2018
 * AUTHOR: Sarva Pulla
 * COPYRIGHT: (c) SERVIR GLOBAL 2018
 * LICENSE: BSD 2-Clause
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var $addModal,
        ContextMenuBase,
        element,
        googleLayer,
        layers,
        layersDict,
        map,
        public_interface,
        ponds_mapid,
        ponds_token,
        popup,
        wmsSource,
        wmsLayer;



    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var addContextMenuToListItem,
        gen_colors,
        get_image,
        get_image_info,
        init_menu,
        init_jquery_vars,
        init_all,
        init_events,
        init_map,
        onClickZoomTo,
        onClickDeleteLayer,
        reset_image_modal;


    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/

    reset_image_modal = function(){
        $("#band-options").html('');
        $("#color-container").html('');
        $("#metadata").addClass('hidden');
        $("#date-picker-gizmos").addClass('hidden');
        $("#btn-get-image").addClass('hidden');
        $("#btn-get-info").removeClass('hidden');
        $("#colors").val('');
        $("#gamma-input").val('');
        $("#add-modal:reset");
        // $( '#add-modal' ).each(function(){
        //     this.reset();
        // });

    };

    init_jquery_vars = function(){
        $addModal = $("#add-modal");
        var $layers_element = $('#layers');
        ponds_mapid = $layers_element.attr('data-ponds-mapid');
        ponds_token = $layers_element.attr('data-ponds-token');
    };

    init_events = function(){
        (function () {
            var target, observer, config;
            // select the target node
            target = $('#app-content-wrapper')[0];

            observer = new MutationObserver(function () {
                window.setTimeout(function () {
                    map.updateSize();
                }, 350);
            });
            $(window).on('resize', function () {
                map.updateSize();
            });

            config = {attributes: true};

            observer.observe(target, config);
        }());
    };

    init_map = function() {
        var projection = ol.proj.get('EPSG:3857');
        var baseLayer =new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        var fullScreenControl = new ol.control.FullScreen();
        var view = new ol.View({
            center: ol.proj.transform([-14.45,14.4974], 'EPSG:4326','EPSG:3857'),
            projection: projection,
            zoom:3
        });

        var testLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://earthengine.googleapis.com/map/3b7e58d997b9a458286473b9d3dd7439/{z}/{x}/{y}?token=bf60bf3ae88163c6de146a555a9f7641"
            })
        });

        var testLayer2 = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://earthengine.googleapis.com/map/6fc80908cf81e1adbdbba98020be107b/{z}/{x}/{y}?token=abb222a474eadc2054ef7244100d75b8"
            })
        });

        // b895ce54ad7b357ee72a62ac071746ea token
        // 717558099e23b90eb2eec9c783f23a84 mapid

        // 54a96d9f86e5069690437d74c4df1911 mapid
        // 14c4fb73077d989774b479e2740a8f38 token

        // 43b1e58ce2366e8f2baf5b5f86d440b0 mapid for watercollection with the proper mask
        // d03174df25204b7bca72339c9c08e163 map token for watercollection with the proper mask

        // 9a93c1f02ef898857e1140a120b5f2f5 mapid for watercollection without the proper mask
        // fd911a5424150227d0bcca60cc7e0c12 token for watercollection without the proper mask

        // image map token ad0f40591ab3d276138d607813f2a0a1
        // image map id 285293268181edbab1f089b1b9db2919

        // mndwi map token aaad63bec2a9ce7996f059983c42d9cd
        // mndwi map image bd7e0dde49d68c9be3ce44baefc0009b

        layers = [baseLayer];

        layersDict = {};

        map = new ol.Map({
            target: document.getElementById("map"),
            layers: layers,
            view: view
        });
        map.addControl(new ol.control.ZoomSlider());
        map.addControl(fullScreenControl);
        map.crossOrigin = 'anonymous';
        element = document.getElementById('popup');

        popup = new ol.Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: true
        });

        map.addOverlay(popup);
    };

    get_image = function(){
        var type = $("#image-type option:selected").val();
        var display = $("#display-input").val();
        var lyr_name = display.replace(/^\s+|\s+$/g, '');
        if (type!=='mapid'){
            var selected=[];
            $("#band-options :selected").each(function(){
                selected.push($(this).val());
            });

            var sel_len = selected.length;
            if(sel_len > 3){
                $addModal.find('.warning').html('<b>Please select three bands only.</b>');
                return false;
            }else{
                $addModal.find('.warning').html('');
            }

            if(sel_len==1){
                if($("#colors").val() == ""){
                    $addModal.find('.warning').html('<b>Please generate a color palette before adding image.</b>');
                    return false;
                }else{
                    $addModal.find('.warning').html('');
                }
            }else{
                if($("#gamma-input").val() == ""){
                    $addModal.find('.warning').html('<b>Please enter a gamma value.</b>');
                    return false;
                }else{
                    $addModal.find('.warning').html('');
                }
                if($("#gamma-input").val() != ""){
                    var gamma_str = $("#gamma-input").val();
                    var gamma_arr = gamma_str.split(',');
                    if(gamma_arr.length > 3){
                        $addModal.find('.warning').html('<b>You can only enter three values for gamma</b>');
                        return false;
                    }else{
                        $addModal.find('.warning').html('');
                    }
                }
            }



            var image = $("#image-input").val();


            var start = $("#start-date").val();
            var end = $("#end-date").val();

            if(sel_len==1){
                var colors = [];
                var num = $("#colors").val();
                var max = $("#max-input").val();
                var min = $("#min-input").val();
                try{
                    $addModal.find('.warning').html('');
                    for(var i = 0; i < num ; i++) {
                        var color_id = 'color' + i;
                        var color = $('#'+color_id).spectrum("get").toHex();
                        colors.push(color);
                    }

                }catch(err){
                    $addModal.find('.warning').html('<b>Please generate a color palette before adding image.</b>');
                    return false;
                }

                var xhr = ajax_update_database("get-image",{"type":type,"image":image,"start":start,"end":end,"max":max,"min":min,"band":selected[0],"colors":JSON.stringify(colors),"picker":"palette"});
            }else{
                var max = $("#max-input").val();
                var min = $("#min-input").val();
                var gamma = $("#gamma-input").val();
                if(max.includes(",") || min.includes(",")){
                    var max_arr = max.split(",");
                    var min_arr = min.split(",");
                    if(max_arr.length > 3 || min_arr.length > 3){
                        $addModal.find('.warning').html('<b>You cannot have more than three max,min values.</b>');
                        return false;
                    }else{
                        $addModal.find('.warning').html('');
                    }
                }

                var xhr = ajax_update_database("get-image",{"type":type,"image":image,"max":max,"min":min,"band":JSON.stringify(selected),"picker":"gamma","gamma":gamma});
            }


            xhr.done(function(data) {
                if("success" in data) {
                    $addModal.find('.warning').html('');
                    $addModal.modal('hide');
                    var url = "https://earthengine.googleapis.com/map/" + data.imageid + "/{z}/{x}/{y}?token=" + data.token;
                    $('<li class="ui-state-default"'+'layer-name="'+lyr_name+'"'+'><input class="chkbx-layer" type="checkbox" checked><span class="layer-name">'+display+'</span><div class="hmbrgr-div"><img src="/static/gee/images/hamburger.svg"></div></li>').appendTo('#current-layers');
                    var $list_item = $('#current-layers').find('li:last-child');

                    addContextMenuToListItem($list_item);
                    googleLayer = new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: "https://earthengine.googleapis.com/map/" + data.imageid + "/{z}/{x}/{y}?token=" + data.token
                        })
                    });
                    map.addLayer(googleLayer);

                    layersDict[lyr_name] = googleLayer;


                    reset_image_modal();

                }else{
                    $addModal.find('.warning').html('<b>'+xhr.responseText+'</b>');
                }
            });
        }else{
            var mapidVal = $('#mapid-input').val();
            var maptokenVal = $('#maptoken-input').val();
            $addModal.modal('hide');
            var url = "https://earthengine.googleapis.com/map/" + mapidVal + "/{z}/{x}/{y}?token=" + maptokenVal;
            $('<li class="ui-state-default"'+'layer-name="'+lyr_name+'"'+'><input class="chkbx-layer" type="checkbox" checked><span class="layer-name">'+display+'</span><div class="hmbrgr-div"><img src="/static/mapserv/images/hamburger.svg"></div></li>').appendTo('#current-layers');
            var $list_item = $('#current-layers').find('li:last-child');

            addContextMenuToListItem($list_item);
            googleLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: url
                })
            });
            map.addLayer(googleLayer);

            layersDict[lyr_name] = googleLayer;


            reset_image_modal();
        }

    };

    $("#btn-get-image").click(get_image);

    get_image_info = function() {
        var image = $("#image-input").val();
        var type = $("#image-type option:selected").val();
        if (type=='img'){
            var xhr = ajax_update_database("get-img-info", {"type": type, "image": image});
            xhr.done(function (data) {
                if ("success" in data) {
                    $("#btn-get-image").removeClass('hidden');
                    $("#metadata").removeClass('hidden');
                    $("#btn-get-info").addClass('hidden');
                    $(".band-options").select2({
                        placeholder: "Select band(s)",
                        allowClear: true
                    });
                    var bands = data.metadata.bandNames;
                    bands.forEach(function (band, i) {
                        var new_option = new Option(band, band);
                        $("#band-options").append(new_option);
                    });

                }
            });
        } else if(type=='imgcol'){
            var xhr = ajax_update_database("get-col-info", {"type": type, "image": image});
            xhr.done(function (data) {
                if ("success" in data) {
                    var startDate = data.metadata.startDate;
                    var endDate = data.metadata.endDate;
                    $('#end-date').datepicker({dateFormat: 'yy-mm-dd',minDate:new Date(startDate),maxDate:new Date(endDate),changeMonth: true,
                        changeYear: true}).datepicker('setDate',new Date(endDate));
                    $('#start-date').datepicker({dateFormat: 'yy-mm-dd',minDate:new Date(startDate),maxDate:new Date(endDate),changeMonth: true,
                        changeYear: true}).datepicker('setDate',new Date(startDate));

                    $("#btn-get-image").removeClass('hidden');
                    $("#date-picker-gizmos").removeClass('hidden');
                    $("#metadata").removeClass('hidden');
                    $("#btn-get-info").addClass('hidden');
                    $(".band-options").select2({
                        placeholder: "Select band(s)",
                        allowClear: true
                    });
                    var bands = data.metadata.bandNames;
                    bands.forEach(function (band, i) {
                        var new_option = new Option(band, band);
                        $("#band-options").append(new_option);
                    });

                }
            });
        }


    };

    $("#btn-get-info").click(get_image_info);


    gen_colors = function(){
        var num = $("#colors").val();

        if(($("#colors").val())==""){
            $addModal.find('.warning').html('<b>Please enter the number of colors. This field cannot be blank.</b>');
            return false;
        }else{
            $addModal.find('.warning').html('');
        }

        $("#color-container").html('');
        for(var i = 0; i < num ; i++){
            var input = '<input type="text" id="color'+i+'" style="display: none;">';
            var color_id = 'color'+i;
            $("#color-container").append(input);
            $('#'+color_id).spectrum({
                color: "#f00"
            });
        }
    };
    $("#btn-gen-colors").click(gen_colors);

    $("#btn-modal-cancel").click(reset_image_modal);

    addContextMenuToListItem = function ($listItem) {
        var contextMenuId;

        $listItem.find('.hmbrgr-div img')
            .contextMenu('menu', ContextMenuBase, {
                'triggerOn': 'click',
                'displayAround': 'trigger',
                'mouseClick': 'left',
                'position': 'right',
                'onOpen': function (e) {
                    $('.hmbrgr-div').removeClass('hmbrgr-open');
                    $(e.trigger.context).parent().addClass('hmbrgr-open');
                },
                'onClose': function (e) {
                    $(e.trigger.context).parent().removeClass('hmbrgr-open');
                }
            });
        contextMenuId = $('.iw-contextMenu:last-child').attr('id');
        $listItem.attr('data-context-menu', contextMenuId);
    };



    init_menu = function(){
        ContextMenuBase = [
            {
                name: 'Zoom To',
                title: 'Zoom To',
                fun: function (e) {
                    onClickZoomTo(e);
                }
            },
            {
                name: 'Delete',
                title: 'Delete',
                fun: function (e) {
                    onClickDeleteLayer(e);
                }
            }
        ];
    };

    //On click zoom to the relevant layer
    onClickZoomTo = function(e){
        var clickedElement = e.trigger.context;
        var $lyrListItem = $(clickedElement).parent().parent();
        var layer_name = $lyrListItem.attr('layer-name');
        var layer_extent = layersDict[layer_name].getExtent();
        map.getView().fit(layer_extent,map.getSize());
        map.updateSize();
    };

    //On click delete the layer, but it won't delete it from the database
    onClickDeleteLayer = function(e){
        var clickedElement = e.trigger.context;
        var $lyrListItem = $(clickedElement).parent().parent();
        var layer_name = $lyrListItem.attr('layer-name');
        map.removeLayer(layersDict[layer_name]);
        delete layersDict[layer_name];
        $lyrListItem.remove();
        map.updateSize();
    };

    $(document).on('change', '.chkbx-layer', function () {
        var displayName = $(this).next().text();
        layersDict[displayName].setVisible($(this).is(':checked'));
    });

    init_all = function(){
        init_menu();
        init_jquery_vars();
        init_map();
        init_events();

    };
    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/
    /*
     * Library object that contains public facing functions of the package.
     * This is the object that is returned by the library wrapper function.
     * See below.
     * NOTE: The functions in the public interface have access to the private
     * functions of the library because of JavaScript function scope.
     */
    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading
    $(function() {
        init_all();


        $("#image-type").change(function(){
            var selected_option = $(this).find('option:selected').val();
            $('#start-date')[ (selected_option =='imgcol') ? "show" : "hide" ]();
            $('#end-date')[ (selected_option =='imgcol') ? "show" : "hide" ]();
            $('#mapid-input')[ (selected_option =='mapid') ? "show" : "hide" ]();
            $('#maptoken-input')[ (selected_option =='mapid') ? "show" : "hide" ]();
            $('#image-input')[ (selected_option =='mapid') ? "hide" : "show" ]();
            if(selected_option =='imgcol'){
                $('label[for="start-date"]').show();
                $('label[for="end-date"]').show();
            }else{
                $('label[for="start-date"]').hide();
                $('label[for="end-date"]').hide();
            }
            if (selected_option == 'mapid'){
                $('label[for="mapid-input"]').show();
                $('label[for="maptoken-input"]').show();
                $('label[for="image-input"]').hide();
                $("#btn-get-image").removeClass('hidden');
                $("#btn-get-info").addClass('hidden');
            }else{
                $('label[for="mapid-input"]').hide();
                $('label[for="maptoken-input"]').hide();
                $('label[for="image-input"]').show();
                $("#btn-get-image").addClass('hidden');
                $("#btn-get-info").removeClass('hidden');
            }


        }).change();

        $("#band-options").on("select2:select", function (evt) {
            var element = evt.params.data.element;
            var $element = $(element);

            $element.detach();
            $(this).append($element);
            $(this).trigger("change");
        });

        $("#band-options").change(function(){
            var selected=[];
            $("#band-options :selected").each(function(){
                selected.push($(this).val());
            });
            var sel_len = selected.length;

            // $('#palette')[ (sel_len == 1 ) ? $("#palette").removeClass('hidden') : $("#palette").addClass('hidden') ]();
            // $('#gamma')[ (sel_len != 1) ? $("#gamma").addClass('hidden') : $("#gamma").removeClass('hidden')]();

            if(sel_len==1){
                $("#palette").removeClass('hidden');
                $("#gamma").addClass('hidden');
            }else{
                $("#gamma").removeClass('hidden');
                $("#palette").addClass('hidden');
            }

        });


    });

    return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.

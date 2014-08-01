var Mappit = (function() {
    // private vars
    var map = new GMaps({
        div: "#map",
        lat: -12.043333,
        lng: -77.028333,
        width: "100%",
        height: "100%"
    });
    var latlngs = [];


    // private methods
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    /**
    *
    * CSV Parser credit goes to Brian Huisman, from his blog entry entitled "CSV String to Array in JavaScript":
    * http://www.greywyvern.com/?post=258
    *
    */
    String.prototype.splitCSV = function(sep) {
        for (var thisCSV = this.split(sep = sep || ","), x = thisCSV.length - 1, tl; x >= 0; x--) {
            if (thisCSV[x].replace(/"\s+$/, '"').charAt(thisCSV[x].length - 1) == '"') {
                if ((tl = thisCSV[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
                    thisCSV[x] = thisCSV[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
                } else if (x) {
                    thisCSV.splice(x - 1, 2, [thisCSV[x - 1], thisCSV[x]].join(sep));
                } else thisCSV = thisCSV.shift().split(sep).concat(thisCSV);
            } else thisCSV[x].replace(/""/g, '"');
        } return thisCSV;
    };

    // initialization
    if (getParameterByName('coords') !== '') { // if there is a coords param in the query string, use it to populate the map by default
        // wait for map to load
        google.maps.event.addListenerOnce(map.map, 'idle', function() {
            AddMarkersByLatLng(JSON.parse(getParameterByName('coords')));
        });
    }
    else { // if not show the panel to add addresses in manually
        TweenMax.to(['#config', '#bg'], 0.5, {autoAlpha: 1});
    }


    // Adding Markers
    function AddMarkersByAddress(opt) {
        var locationCount = opt.locations.length;
        var current = 0;
        $.each(opt.locations, function(i, location) {
            GMaps.geocode({
                address: location[1],
                callback: function(results, status) {
                    if (status == "OK") {
                        var latlng = results[0].geometry.location;
                        map.setCenter(latlng.lat(), latlng.lng());
                        map.addMarker({
                            lat: latlng.lat(),
                            lng: latlng.lng(),
                            infoWindow: {
                                content: '<p>' + location[0] + '</p>'
                            }
                        });
                        latlngs.push([latlng.lat(), latlng.lng()]);
                    }

                    current++;
                    opt.onUpdate(current);

                    if (current === locationCount) {
                        opt.onComplete();
                        map.fitZoom();
                        ui.map.show();
                    }
                }
            });
        });
    }
    function AddMarkersByLatLng(coords) {
        var locationCount = coords.length;
        var current = 0;
        console.log(coords);
        $.each(coords, function() {
            map.addMarker({
                lat: this[0],
                lng: this[1]
            });

            current++;
            if (current === locationCount) {
                map.fitZoom();
                ui.map.show();
                ui.nav.show();
            }
        });
    }

    // UI elements
    var ui = {
        buttons: {
            mappit: {
                id: '#mappit',
                $: $('#mappit')
            }
        },
        map: {
            id: '#map',
            $: $('#map'),
            show: function() {
                TweenMax.to(this.id, 0.25, {delay: 2, autoAlpha: 1, zIndex: 1});
            },
            hide: function() {
                TweenMax.to(this.id, 0.25, {delay: 0, autoAlpha: 0, zIndex: 0});
            },
            title: {
                id: '#maptitle',
                $: $('#maptitle'),
                show: function() {
                    TweenMax.set(this.id, {autoAlpha: 0, scale: 0, z: 0.01});
                    ui.config.hide();
                    TweenMax.to(this.id, 2, {scale: 1.2 });
                    //notice the 3rd parameter of the SlowMo config is true in the following tween - that causes it to yoyo, meaning opacity (autoAlpha) will go up to 1 during the tween, and then back down to 0 at the end. 
                    TweenMax.to(this.id, 2, {autoAlpha: 1});
                },
                hide: function() {

                }
            }
        },
        nav: {
            id: '#navbar',
            $: $('#navbar'),
            show: function() {
                TweenMax.set(this.id, {y: -$('#navbar').height()});
                TweenMax.to(this.id, 0.25, {delay: 3.25, autoAlpha: 1, zIndex: 2, y: 20});
            },
            hide: function() {
                TweenMax.to(this.id, 0.35, {autoAlpha: 0});
            }
        },
        config: {
            id: '#config',
            $: $('#config'),
            show: function() {
                TweenMax.set(this.id, {zIndex: 2});
                TweenMax.to(this.id, 0.35, {autoAlpha: 1});
            },
            hide: function() {
                TweenMax.to(this.id, 0.25, { autoAlpha: 0, zIndex: 0});
            },
            mapTitleText: {
                id: '#maptitletext',
                $: $('#maptitletext')
            }
        },
        data: {
            id: '#addresses',
            $: $('#addresses'),
            show: function() {
                TweenMax.to(this.id, 0.25, {autoAlpha: 1, display: 'block'});
            },
            hide: function() {
                TweenMax.to(this.id, 0.15, {autoAlpha: 0, display: 'none'});
            }
        },
        tabledata: {
            id: '#tabledata',
            $: $('#tabledata'),
            show: function() {
                TweenMax.to([this.id], 0.25, {autoAlpha: 1, display: 'table'});
            },
            hide: function() {
                TweenMax.to([this.id], 0.15, {autoAlpha: 0, display: 'none'});
            }
        },
        share: {
            id: '#shareurl',
            $: $('#shareurl'),
            show: function() {
                TweenMax.to(this.id, 0.25, {autoAlpha: 1});
                TweenMax.from(this.id, 0.25, {y: -50});
            },
            hide: function() {
                TweenMax.to(this.id, 0.25, {autoAlpha: 0});
            }
        }
    };

    // is this a cool way to handle ui concerns? pass em in?
    ~function(map, mapTitle, mapTitleText, mappitButton, config, nav){
        console.log('Hello World!');
    
        var x = 1;
        // Bind UI
        mappitButton.$.on('click', function() {
            var originalText = mappitButton.$.html(),
                lines = $('#addresses').val().replace('\r', '').split('\n'),
                data = [];

            mappitButton.$.html('Adding markers...');
            $.each(lines, function(i, line) {
                var separator = (line.indexOf('\t') > -1) ? '\t' : ',';
                data.push(line.splitCSV(separator));
            });

            mapTitle.$.html(mapTitleText.$.val());
            mapTitle.show();

            Mappit.AddMarkersByAddress({
                locations: data,
                onUpdate: function(i) {
                    console.log('marker ' + i);
                    mappitButton.$.html('Creating map... Adding marker ' + i + '...');
                },
                onComplete: function() {
                    console.log('done');
                    map.show();
                    config.hide();
                    nav.show();
                    mappitButton.$.html(originalText);
                }
            });
        });
    }(ui.map, ui.map.title, ui.config.mapTitleText, ui.buttons.mappit, ui.config, ui.nav);
    

    $('#checkit').on('click', function() {
        var $result = $('#prettydata');
        var prettydata = '';
        var lines = $('#addresses').val().replace('\r','').split('\n');
        
        $result.html();
        $.each(lines, function(i, line) {
            var separator = (line.indexOf('\t') > -1) ? '\t' : ',';
            prettydata += '<tr>';
            var cols = line.splitCSV(separator);
            $.each(line.splitCSV(separator), function(i, col) {
                prettydata += '<td>' + col + '</td>';
            });

            if (cols.length < 4) {
                for (i = 0; i < 4 - cols.length; i++) {
                    prettydata += "<td></td>";
                }
            }

            prettydata += '</tr>';
        });

        $result.html(prettydata);

        ui.tabledata.show();
        ui.data.hide();
        $(this).hide();
        $('#editit').show();
    });
    
    $('#editit').on('click', function() {
        ui.data.show();
        ui.tabledata.hide();
        $(this).hide();
        $('#checkit').show();
    });

    $('#edit').on('click', function() {
        Mappit.ui.config.show();
        Mappit.ui.map.hide();
        Mappit.ui.nav.hide();
        Mappit.ui.share.hide();

    });
    $('#share').on('click', function() {
        $('#shareurl').val(Mappit.ShareURL());
        Mappit.ui.share.show();
    });

    // public object
    return {
        AddMarkersByAddress: AddMarkersByAddress,
        AddMarkersByLatLng: AddMarkersByLatLng,
        ui: ui,
        ShareURL: function() {
            return window.location + '?' + 'coords=' + encodeURIComponent(JSON.stringify(latlngs));
        }
    };
})();

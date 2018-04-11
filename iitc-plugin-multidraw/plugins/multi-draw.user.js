// ==UserScript==
// @id             iitc-plugin-multidraw@kewwwa
// @name           IITC plugin: Multi draw
// @category       Layer
// @version        0.2.20180411.94013
// @namespace      https://github.com/kewwwa/iitc-plugin-multidraw
// @updateURL      https://kewwwa.github.io/iitc-plugin-multidraw/plugins/multi-draw.meta.js
// @downloadURL    https://kewwwa.github.io/iitc-plugin-multidraw/plugins/multi-draw.user.js
// @description    [kewwwa-2018-04-11-094013] Draw multiple links
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'kewwwa';
plugin_info.dateTimeVersion = '20180411.94013';
plugin_info.pluginId = 'multi-draw';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////
var setup = (function (window, document, undefined) {
    'use strict';
    
    var plugin, elements,
        isAutoMode = false,
        previousSelectedPortal,
        firstPortal, secondPortal,
        types = {
            function: 'function',
        },
        classList = {
            hidden: 'hidden',
            active: 'active'
        };

    plugin = function () { };
    if (typeof window.plugin !== types.function) window.plugin = function () { };
    window.plugin.multidraw = plugin;

    return setup;

    function toggleMenu() {
        if (elements.actions.classList.contains(classList.hidden)) {
            elements.actions.classList.remove(classList.hidden);
        }
        else {
            elements.actions.classList.add(classList.hidden);
        }
    }

    function toggleAutoMode() {
        isAutoMode = !isAutoMode;
        if(isAutoMode) {
            elements.autoModeLink.classList.add(classList.active);
        } else {
            elements.autoModeLink.classList.remove(classList.active);
            toggleMenu();
        }
    }

    function onPortalSelected() {
        if(!isAutoMode) return;

        var portal = getPortalSelected();
        if(!portal) return;

        if(!previousSelectedPortal || previousSelectedPortal.guid !== portal.guid) {
            previousSelectedPortal = portal;
            log('portal selectected > ' + portal.guid);
            draw(portal);
        }
    }

    function selectFirstPortal() {
        firstPortal = getPortalSelected();

        if(firstPortal) {
            log('First portal selected');
            toggleMenu();
            elements.firstPortalLink.innerText = 'A';
            elements.firstPortalLink.title = 'Reset portal base A';
            elements.secondPortal.classList.remove(classList.hidden);
        }
    }

    function selectSecondPortal() {
        secondPortal = getPortalSelected();

        if (firstPortal && secondPortal && secondPortal.guid !== firstPortal.guid) {
            log('Second portal selected');
            toggleMenu();
            draw(secondPortal);
            elements.secondPortalLink.innerText = 'B';
            elements.secondPortalLink.title = 'Reset portal base B';
            elements.otherPortal.classList.remove(classList.hidden);
            elements.allPortals.classList.remove(classList.hidden);
            elements.autoMode.classList.remove(classList.hidden);
        }
    }

    function selectOtherPortal() {
        var portal;
        log('Other portal selected');
        toggleMenu();

        portal = getPortalSelected();
        if (!portal) return;

        draw(portal);
    }

    function selectAllPortals() {
        var portals;
        log('All portals selected');
        toggleMenu();
        if (!firstPortal || !secondPortal) return;

        portals = getAllPortals();
        if (!portals) return;

        $.each(portals, function(i, portal) {
            if(portal.guid !== firstPortal.guid && portal.guid !== secondPortal.guid) {
                draw(portal);
            }
        });
    }

    function getAllPortals() {
        var portals = [],
            displayBounds = map.getBounds();

        $.each(window.portals, function(i, portal) {
            if(displayBounds.contains(portal.getLatLng())) {
                portals.push(getPortalData(portal));
            }
        });

        return portals;
    }

    function draw(portal) {
        var latlngs, layerType = 'polyline';

        if (!firstPortal || !secondPortal) return;

        latlngs = [];
        latlngs.push(firstPortal.ll);
        if (portal.guid !== secondPortal.guid) {
            latlngs.push(portal.ll);
            layerType = 'polygon';
        }
        latlngs.push(secondPortal.ll);

        window.map.fire('draw:created', {
            layer: L.geodesicPolyline(latlngs, window.plugin.drawTools.lineOptions),
            layerType: layerType
        });

        if (!window.map.hasLayer(window.plugin.drawTools.drawnItems)) {
            window.map.addLayer(window.plugin.drawTools.drawnItems);
        }
    }

    function getPortalSelected() {
        if (selectedPortal) {
            return getPortalData(portals[selectedPortal]);
        }
    }

    function getPortalData(portal) {
        if(portal) {
            return {
                guid: portal.options.guid,
                ll: portal.getLatLng()
            };
        }
    }

    function log(message) {
        console.log('Multi draw: ' + message);
    }

    function setup() {
        var parent, control, section,
            toolbar, button;

        $('<style>').prop('type', 'text/css')
            .html('.leaflet-control-multidraw .leaflet-draw-actions{display: block}.leaflet-control-multidraw .hidden{display: none}.leaflet-control-multidraw .leaflet-draw-actions a.active{background-color:#5A5A5A}.leaflet-control-multidraw a.leaflet-multidraw-edit-edit {background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+Cgk8ZyBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eTowLjQ7c3Ryb2tlOm5vbmUiPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSw2IHoiLz4KCQk8cGF0aCBkPSJNIDYsMjQgMjQsMjQgMTUsMTIgeiIvPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSwxOCB6Ii8+Cgk8L2c+Cjwvc3ZnPgo=");}')
            .appendTo('head');

        elements = {};

        elements.firstPortalLink = document.createElement('a');
        elements.firstPortalLink.innerText = 'Select portal base A';
        //elements.firstPortalLink.title = 'Select portal base A';
        elements.firstPortalLink.addEventListener('click', selectFirstPortal, false);
        elements.firstPortal = document.createElement('li');
        elements.firstPortal.appendChild(elements.firstPortalLink);

        elements.secondPortalLink = document.createElement('a');
        elements.secondPortalLink.innerText = 'Select portal base B';
        elements.secondPortalLink.title = 'Select second portal';
        elements.secondPortalLink.addEventListener("click", selectSecondPortal, false);
        elements.secondPortal = document.createElement("li");
        elements.secondPortal.className = classList.hidden;
        elements.secondPortal.appendChild(elements.secondPortalLink);

        elements.otherPortalLink = document.createElement("a");
        elements.otherPortalLink.innerText = "+1";
        elements.otherPortalLink.title = 'Add new portal';
        elements.otherPortalLink.addEventListener("click", selectOtherPortal, false);
        elements.otherPortal = document.createElement("li");
        elements.otherPortal.className = classList.hidden;
        elements.otherPortal.appendChild(elements.otherPortalLink);

        elements.allPortalsLink = document.createElement("a");
        elements.allPortalsLink.innerText = "ALL";
        elements.allPortalsLink.title = 'Select All portal';
        elements.allPortalsLink.addEventListener("click", selectAllPortals, false);
        elements.allPortals = document.createElement("li");
        elements.allPortals.className = classList.hidden;
        elements.allPortals.appendChild(elements.allPortalsLink);

        elements.autoModeLink = document.createElement("a");
        elements.autoModeLink.innerText = "Auto";
        elements.autoModeLink.title = 'Auto mode';
        elements.autoModeLink.addEventListener("click", toggleAutoMode, false);
        elements.autoMode = document.createElement("li");
        elements.autoMode.className = classList.hidden;
        elements.autoMode.appendChild(elements.autoModeLink);

        elements.actions = document.createElement("ul");
        elements.actions.className = "leaflet-draw-actions leaflet-draw-actions-top hidden";
        elements.actions.appendChild(elements.firstPortal);
        elements.actions.appendChild(elements.secondPortal);
        elements.actions.appendChild(elements.otherPortal);
        elements.actions.appendChild(elements.allPortals);
        elements.actions.appendChild(elements.autoMode);

        button = document.createElement("a");
        button.className = "leaflet-multidraw-edit-edit";
        button.addEventListener("click", toggleMenu, false);
        button.title = 'Draw multi links';

        toolbar = document.createElement("div");
        toolbar.className = "leaflet-draw-toolbar leaflet-bar";
        toolbar.appendChild(button);

        section = document.createElement("div");
        section.className = "leaflet-draw-section";
        section.appendChild(toolbar);
        section.appendChild(elements.actions);

        control = document.createElement("div");
        control.className = "leaflet-control-multidraw leaflet-draw leaflet-control";
        control.appendChild(section);

        parent = $(".leaflet-top.leaflet-left", window.map.getContainer());
        parent.append(control);

        window.addHook('portalSelected', onPortalSelected);
    }
})(window, document);
// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


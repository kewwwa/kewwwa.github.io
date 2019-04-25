// ==UserScript==
// @id             iitc-plugin-multidraw@kewwwa
// @name           IITC plugin: Multi draw
// @category       Layer
// @version        0.1.20190425.110032
// @namespace      https://github.com/kewwwa/iitc-plugin-multidraw
// @updateURL      https://kewwwa.github.io/iitc-plugin-multidraw/plugins/multi-draw.meta.js
// @downloadURL    https://kewwwa.github.io/iitc-plugin-multidraw/plugins/multi-draw.user.js
// @description    [kewwwa-2019-04-25-110032] Draw multiple links
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

//
function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'kewwwa';
plugin_info.dateTimeVersion = '20190425.110032';
plugin_info.pluginId = 'multi-draw';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////
var setup = (function(window, document, undefined) {
  'use strict';

  var plugin, actions, isAutoMode, firstPortal, secondPortal,
      previousSelectedPortal, firstPortalLink, secondPortalLink, autoModeLink,
      types = {function: 'function'},
      classList = {active: 'active', highlighted: 'highlighted'};

  plugin = function() {};
  if (typeof window.plugin !== types.function) window.plugin = function() {};
  window.plugin.multidraw = plugin;

  return setup;

  function toggleMenu() {
    if (actions.classList.contains(classList.active)) {
      actions.classList.remove(classList.active);
    } else {
      actions.classList.add(classList.active);
    }
  }

  function clear() {
    firstPortal = false;
    secondPortal = false;
    isAutoMode = false;

    firstPortalLink.classList.remove(classList.highlighted);
    secondPortalLink.classList.remove(classList.highlighted);
    autoModeLink.classList.remove(classList.highlighted);
  }

  function toggleAutoMode() {
    isAutoMode = !isAutoMode;
    if (isAutoMode) {
      autoModeLink.classList.add(classList.highlighted);
    } else {
      autoModeLink.classList.remove(classList.highlighted);
      toggleMenu();
    }
  }

  function onPortalSelected() {
    if (!isAutoMode) return;

    var portal = getPortalSelected();
    if (!portal) return;

    if (!previousSelectedPortal ||
        previousSelectedPortal.guid !== portal.guid) {
      previousSelectedPortal = portal;
      log('portal selectected > ' + portal.guid);
      draw(portal);
    }
  }

  function selectFirstPortal() {
    log('First portal selected');

    firstPortal = getPortalSelected();

    if (firstPortal &&
        !firstPortalLink.classList.contains(classList.highlighted)) {
      firstPortalLink.classList.add(classList.highlighted);
    }
  }

  function selectSecondPortal() {
    var latlngs;
    log('Second portal selected');

    secondPortal = getPortalSelected();
    if (!secondPortal) {
      return;
    }
    if (!secondPortalLink.classList.contains(classList.highlighted)) {
      secondPortalLink.classList.add(classList.highlighted);
    }

    draw();
  }

  function selectOtherPortal() {
    var portal;
    log('Other portal selected');

    portal = getPortalSelected();
    if (!portal) return;

    draw(portal);
  }

  function draw(portal) {
    var latlngs;
    let round = (num, accuracy) =>
        Math.round(num * Math.pow(10, accuracy)) / Math.pow(10, accuracy);
    let lleq = (l1, l2) => round(l1.lat, 5) === round(l2.lat, 5) &&
        round(l1.lng, 5) === round(l2.lng, 5);  // are latlngs equal
    let polylineeq = (ll1, ll2) => ll1.length === ll2.length &&
        (ll1.every((_, i) => lleq(ll1[i], ll2[i])) ||
         ll1.slice().reverse().every((_, i) => lleq(ll1[i], ll2[i])))
    // polyline compare. must have the same amount of points and nth point must
    // be equal to nth point of secont polyline or the same but one polyline is
    // reversed

    if (!firstPortal || !secondPortal) {
      return;
    }

    latlngs = [];
    latlngs.push(firstPortal.ll);
    if (portal) latlngs.push(portal.ll);
    latlngs.push(secondPortal.ll);

    let foundSame = false;
    window.plugin.drawTools.drawnItems.eachLayer(function(layer) {
      if (layer instanceof L.GeodesicPolyline || layer instanceof L.Polyline) {
        if (foundSame) return;
        foundSame = polylineeq(layer._latlngs, latlngs);
      }
    });
    if (foundSame) return;

    window.map.fire('draw:created', {
      layer: L.geodesicPolyline(latlngs, window.plugin.drawTools.lineOptions),
      layerType: 'polyline'
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
    if (portal) {
      return {guid: portal.options.guid, ll: portal.getLatLng()};
    }
  }

  function log(message) {
    // console.log('Multi draw: ' + message);
  }

  function setup() {
    var parent, control, section, toolbar, button, autoModeLi, clearLi,
        firstPortalLi, secondPortalLi, otherPortalLi, clearLink,
        otherPortalLink;

    window.addHook('portalSelected', onPortalSelected);

    $('<style>')
        .prop('type', 'text/css')
        .html(
            '.leaflet-draw-actions.active{display: block;}.leaflet-control-multidraw a.leaflet-multidraw-edit-edit {background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+Cgk8ZyBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eTowLjQ7c3Ryb2tlOm5vbmUiPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSw2IHoiLz4KCQk8cGF0aCBkPSJNIDYsMjQgMjQsMjQgMTUsMTIgeiIvPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSwxOCB6Ii8+Cgk8L2c+Cjwvc3ZnPgo=");}')
        .appendTo('head');
    $('<style>')
        .prop('type', 'text/css')
        .html('.multidraw.highlighted{background-color:#008902}')
        .appendTo('head');

    button = document.createElement('a');
    button.className = 'leaflet-multidraw-edit-edit';
    button.addEventListener('click', toggleMenu, false);
    button.title = 'Draw multi links';

    toolbar = document.createElement('div');
    toolbar.className = 'leaflet-draw-toolbar leaflet-bar';
    toolbar.appendChild(button);

    clearLink = document.createElement('a');
    clearLink.innerText = 'X';
    clearLink.title = 'Clear selected portals';
    clearLink.addEventListener('click', clear, false);
    clearLi = document.createElement('li');
    clearLi.appendChild(clearLink);

    firstPortalLink = document.createElement('a');
    firstPortalLink.className = 'multidraw';
    firstPortalLink.innerText = 'A';
    firstPortalLink.title = 'Select portal base A';
    firstPortalLink.addEventListener('click', selectFirstPortal, false);
    firstPortalLi = document.createElement('li');
    firstPortalLi.appendChild(firstPortalLink);

    secondPortalLink = document.createElement('a');
    secondPortalLink.className = 'multidraw';
    secondPortalLink.innerText = 'B';
    secondPortalLink.title = 'Select portal base B';
    secondPortalLink.addEventListener('click', selectSecondPortal, false);
    secondPortalLi = document.createElement('li');
    secondPortalLi.appendChild(secondPortalLink);

    otherPortalLink = document.createElement('a');
    otherPortalLink.innerText = '+1';
    otherPortalLink.title = 'Add field on selected portal';
    otherPortalLink.addEventListener('click', selectOtherPortal, false);
    otherPortalLi = document.createElement('li');
    otherPortalLi.appendChild(otherPortalLink);

    autoModeLink = document.createElement('a');
    autoModeLink.className = 'multidraw';
    autoModeLink.innerText = 'Auto';
    autoModeLink.title = 'Add field on each portal selection';
    autoModeLink.addEventListener('click', toggleAutoMode, false);
    autoModeLi = document.createElement('li');
    autoModeLi.appendChild(autoModeLink);

    actions = document.createElement('ul');
    actions.className = 'leaflet-draw-actions leaflet-draw-actions-top';
    actions.appendChild(clearLi);
    actions.appendChild(firstPortalLi);
    actions.appendChild(secondPortalLi);
    actions.appendChild(otherPortalLi);
    actions.appendChild(autoModeLi);

    section = document.createElement('div');
    section.className = 'leaflet-draw-section';
    section.appendChild(toolbar);
    section.appendChild(actions);

    control = document.createElement('div');
    control.className =
        'leaflet-control-multidraw leaflet-draw leaflet-control';
    control.appendChild(section);

    parent = $('.leaflet-top.leaflet-left', window.map.getContainer());
    parent.append(control);
  }
})(window, document);
// PLUGIN END //////////////////////////////////////////////////////////

//
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



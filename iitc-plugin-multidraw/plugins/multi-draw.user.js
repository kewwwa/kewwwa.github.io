// ==UserScript==
// @id             iitc-plugin-multidraw@kewwwa
// @name           IITC plugin: Multi draw
// @category       Layer
// @version        0.1.20190425.142937
// @namespace      https://github.com/kewwwa/iitc-plugin-multidraw
// @updateURL      https://kewwwa.github.io/iitc-plugin-multidraw/plugins/multi-draw.meta.js
// @downloadURL    https://kewwwa.github.io/iitc-plugin-multidraw/plugins/multi-draw.user.js
// @description    [kewwwa-2019-04-25-142937] Draw multiple links
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
plugin_info.dateTimeVersion = '20190425.142937';
plugin_info.pluginId = 'multi-draw';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////
var setup = (function (window, document, undefined) {
  'use strict';

  var plugin, actions, isAutoMode, firstPortal, secondPortal,
    previousSelectedPortal, clearLink, firstPortalLink, secondPortalLink,
    otherPortalLink, autoModeLink,
    classList = { active: 'active', hidden: 'hidden' },
    text = {
      A: {
        init: {
          text: 'Select portal base A',
          tooltip: 'Click to mark selected portal'
        },
        active: {
          text: 'A',
          tooltip: 'Reset portal base A'
        }
      },
      B: {
        init: {
          text: 'Select portal base B',
          tooltip: 'Click to mark selected portal'
        },
        active: {
          text: 'B',
          tooltip: 'Reset portal base B'
        }
      },
    };

  plugin = function () { };
  if (typeof window.plugin !== 'function') window.plugin = function () { };
  window.plugin.multidraw = plugin;

  return setup;

  function toggleMenu() {
    if (actions.classList.contains(classList.hidden)) {
      actions.classList.remove(classList.hidden);
    } else {
      actions.classList.add(classList.hidden);
    }
  }

  function clear() {
    firstPortal = false;
    secondPortal = false;
    isAutoMode = false;

    firstPortalLink.innerText = text.A.init.text;
    firstPortalLink.title = text.A.init.tooltip;
    firstPortalLink.classList.remove(classList.active);

    secondPortalLink.innerText = text.B.init.text;
    secondPortalLink.title = text.B.init.tooltip;
    secondPortalLink.classList.remove(classList.active);
    secondPortalLink.classList.add(classList.hidden);

    autoModeLink.classList.remove(classList.active);
    autoModeLink.classList.add(classList.hidden);

    otherPortalLink.classList.add(classList.hidden);
    clearLink.classList.add(classList.hidden);
  }

  function toggleAutoMode() {
    isAutoMode = !isAutoMode;
    if (isAutoMode) {
      autoModeLink.classList.add(classList.active);
    } else {
      autoModeLink.classList.remove(classList.active);
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

    var portal = getPortalSelected();
    if (!portal) {
      alert('Select a portal to mark.');
      return;
    }

    clear();

    firstPortal = portal;

    firstPortalLink.innerText = text.A.active.text;
    firstPortalLink.title = text.A.active.tooltip;
    firstPortalLink.classList.add(classList.active);

    clearLink.classList.remove(classList.hidden);
    secondPortalLink.classList.remove(classList.hidden);
  }

  function selectSecondPortal() {
    var latlngs;
    log('Second portal selected');

    secondPortal = getPortalSelected();
    if (!secondPortal) {
      alert('Select a portal to mark.');
      return;
    }
    if (secondPortal.guid === firstPortal.guid) {
      alert('Select another portal to mark.');
      return;
    }

    secondPortalLink.innerText = text.B.active.text;
    secondPortalLink.title = text.B.active.tooltip;
    secondPortalLink.classList.add(classList.active);

    otherPortalLink.classList.remove(classList.hidden);
    autoModeLink.classList.remove(classList.hidden);

    draw();
  }

  function selectOtherPortal() {
    var portal;
    log('Other portal selected');

    portal = getPortalSelected();
    if (!portal) {
      alert('Select a portal to mark.');
      return;
    }
    if (portal.guid === firstPortal.guid || portal.guid === secondPortal.guid) {
      alert('Select another portal to mark.');
      return;
    }

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
    window.plugin.drawTools.drawnItems.eachLayer(function (layer) {
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
      return { guid: portal.options.guid, ll: portal.getLatLng() };
    }
  }

  function log(message) {
    // console.log('Multi draw: ' + message);
  }

  function setup() {
    var parent, control, section, toolbar, button, autoModeLi, clearLi,
      firstPortalLi, secondPortalLi, otherPortalLi;

    window.addHook('portalSelected', onPortalSelected);

    $('<style>')
      .prop('type', 'text/css')
      .html('.leaflet-control-multidraw .leaflet-draw-actions {\n    display: block;\n}\n\n.leaflet-control-multidraw .hidden {\n    display: none;\n}\n\n.leaflet-control-multidraw .leaflet-draw-actions a.active {\n    background-color: #008902;\n}\n\n.leaflet-control-multidraw a.leaflet-multidraw-edit-edit {\n    background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNv1OCegAAAIlSURBVEhLvVWvswFRGN1kBEEQmBEM/gAzBNEYwRhRFN4YURQEM6IgCKIgmCEIgiAKgmiMIAqCIAiCIHjnvfvN3d37Y9/15nknmD13d889e3zfd63n2/Dv0o/HIxqN3u934hI8bnGopTebTTabJSLhdDrFYrHL5UJcA7V0t9tttVpEJBQKhXa7TUQPtXSxWFwul0Tc6Pf7mUwGiRHXQyGN14LB4O12I+7Afr8PhUKHw4G4JxTSuqCxZSqVGgwGxH+CQloXdLPZLJfLRAygkFYGvVqtwuHw+XwmbgBRWhk0KKptNpsRN4MorQz64xtEjCFKy0HDLCwrC8YborQQNBoPEa/Xa+JueLe7S1oOGjvp2hJViF2v1ytxCS5pIWi8jEKWG+94POZyOdzabre0pIJL2hk0Wg5fIDce9sN6p9ORtxTgkuZB4zUMCowLts5gaJbDlnYGjcGG8cbWGczNctjSPGhcYAahNtj6q2Y5bGkWtNB4vzDLYUuzoOv1erVaBTU0i4+bz+eYXHg4EAg4C5ekWdCTyQSWUaoeZvEyOqjX61UqFZyfeAye8ORisRBqnKSRbzqdRsTT6VQ2ixNgNBo1Gg2s+/1+/OJ6PB57nwkkjaATiUQ+n2dmMTzhAnUCR1iBO3hELcKvyVnOQNLxeNzn80UikVKplEwmkRq8419Fji/NaCe+pHHsW5YFd7VabTgcvlpkOpDr3W7HLv4QJP0OvE36+fwEa9FfUxJlSk0AAAAASUVORK5CYII=\');\n}')
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
    clearLink.className = classList.hidden;
    clearLink.addEventListener('click', clear, false);
    clearLi = document.createElement('li');
    clearLi.appendChild(clearLink);

    firstPortalLink = document.createElement('a');
    firstPortalLink.innerText = text.A.init.text;
    firstPortalLink.title = text.A.init.tooltip;
    firstPortalLink.addEventListener('click', selectFirstPortal, false);
    firstPortalLi = document.createElement('li');
    firstPortalLi.appendChild(firstPortalLink);

    secondPortalLink = document.createElement('a');
    secondPortalLink.innerText = text.B.init.text;
    secondPortalLink.title = text.B.init.tooltip;
    secondPortalLink.className = classList.hidden;
    secondPortalLink.addEventListener('click', selectSecondPortal, false);
    secondPortalLi = document.createElement('li');
    secondPortalLi.appendChild(secondPortalLink);

    otherPortalLink = document.createElement('a');
    otherPortalLink.innerText = '+1';
    otherPortalLink.title = 'Add field on selected portal';
    otherPortalLink.className = classList.hidden;
    otherPortalLink.addEventListener('click', selectOtherPortal, false);
    otherPortalLi = document.createElement('li');
    otherPortalLi.appendChild(otherPortalLink);

    autoModeLink = document.createElement('a');
    autoModeLink.innerText = 'Auto';
    autoModeLink.title = 'Add field on each portal selection';
    autoModeLink.className = classList.hidden;
    autoModeLink.addEventListener('click', toggleAutoMode, false);
    autoModeLi = document.createElement('li');
    autoModeLi.appendChild(autoModeLink);

    actions = document.createElement('ul');
    actions.className = 'leaflet-draw-actions ' + classList.hidden;
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



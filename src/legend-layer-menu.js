(function() {
  "use strict";

  function LegendLayerMenu(rootSelector) {

    var that              = this,
        rootNode          = document.querySelector(rootSelector), //"#legend-layer-menu"
        layerTemplate     = "<li id=\"yes-drop\" class=\"draggable drag-drop layer-item-{id}\" data-id=\"{id}\"> <div class=\"grab\"></div>{label}</li>",
        inputFormTemplate = "<div class=\"input-form hidden\"><form class=\"input-form-element\" name=\"{layerid}-input-form\"><input type=\"text\" name=\"uri\" placeholder=\"EcoEnginwel API URI\" value=\"https://dev-ecoengine.berkeley.edu/api/observations/?format=geojson&selected_facets=genus_exact%3A%22tamias%22&q=&min_date=1920-12-30&max_date=1970-12-30&page_size=2000\"><input type=\"text\" name=\"label\" placeholder=\"A name for this layer\"><button>Add</button></form></div>";

    rootNode.classList.add("legend-layer-menu");

    var oldParent;

    var dragConfig = {

      onstart: function(event) {

        var oTop    = event.target.offsetTop,
            oLeft   = event.target.offsetLeft,
            oParent = event.target.parentNode;

        oldParent = oParent;

        rootNode.appendChild(event.target);

        event.target.setAttribute("data-x", (event.clientX-event.target.offsetLeft)-(event.clientX-oLeft));
        event.target.setAttribute("data-y", (event.clientY-event.target.offsetTop)-(event.clientY-oTop));

        /*
        event.target.style.webkitTransform =
        event.target.style.transform =
        "translate(" + (event.pageX-event.target.offsetLeft) + "px, " + (event.pageY-event.target.offsetTop) + "px)";
        */

        event.target.parentNode.classList.add("dragging");
      },

      // call this function on every dragmove event
      onmove: function (event) {

        //event.target.setAttribute("data-x", event.target.offsetLeft-event.target.parentNode.offsetLeft);
        //event.target.setAttribute("data-y", event.target.offsetTop-event.target.parentNode.offsetTop);

        var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
        y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy,

        isListItem = event.dropzone ? event.dropzone.selector.indexOf("draggable") : "null",
        dropZone   = event.dropzone ? document.querySelector(event.dropzone.selector) : null;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);

        if (isListItem > -1) {
          if (dropZone && dropZone.parentNode) {
            var dragPosState = [[event.pageX, event.pageY], [(dropZone.offsetLeft+dropZone.parentNode.offsetLeft+dropZone.offsetWidth)/2, (dropZone.offsetTop+dropZone.parentNode.offsetTop+dropZone.offsetHeight)/2]];

            if (dragPosState[0][1] < dragPosState[1][1]) {
              //dropZone.style.borderTop = "inset 3px black";
              dropZone.style.borderBottom = "solid 1px #777";
              dropZone.setAttribute("data-drop-direction","top");
            } else {
              dropZone.style.borderTop = "solid 1px #777";
              //dropZone.style.borderBottom = "inset 3px black";
              dropZone.setAttribute("data-drop-direction","bottom");
            }
          }
        }
      },
      // call this function on every dragend event
      onend: function (event) {
        event.target.style["-webkit-transform"] = "translate(0,0)";
        event.target.style["transform"] = "translate(0,0)";
        event.target.parentNode.classList.remove("dragging");

        if (event.target.parentNode.classList.contains("legend-layer-menu")) {
          oldParent.appendChild(event.target);
        }

        oldParent = null;
      }
    };

    var dropConfig = {
      // only accept elements matching this CSS selector
      accept: ".drag-drop",
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.1,

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add("drop-active");
      },
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add("drop-target");
        draggableElement.classList.add("can-drop");
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove("drop-target");
        event.relatedTarget.classList.remove("can-drop");
        clearMargins();
      },
      ondrop: function dropEvent(event) {
        if (event.target.classList.contains("draggable") || event.target.classList.contains("draggable-2")) {

          if (event.target.getAttribute("data-drop-direction") === "top") {
            event.target.parentNode.insertBefore(event.relatedTarget, event.target);
          } else {
            if (event.target.nextSibling) {
              event.target.parentNode.insertBefore(event.relatedTarget, event.target.nextSibling);
            } else {
              event.target.parentNode.appendChild(event.relatedTarget);
            }
          }

        } else {
          event.target.appendChild(event.relatedTarget);
        }
        clearMargins();
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove("drop-active");
        event.target.classList.remove("drop-target");
      },
      ondropmove: function(event) {

      }
    };

    function clearMargins() {
      var dropzones = document.querySelectorAll(".dropzone");

      for (var i=0; dropzones.length > i; i++) {
        for (var ii=0; dropzones[i].children.length > ii; ii++) {
          dropzones[i].children[ii].style.borderTop = "solid 1px #777";
          dropzones[i].children[ii].style.borderBottom = "solid 1px #777";
          dropzones[i].children[ii].setAttribute("data-drop-direction",null);
        }
      }
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) {func.apply(context, args);}
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {func.apply(context, args);}
      };
    }

    function append(rootNode, html) {
      var div = document.createElement("div");
      div.innerHTML = html;
      while (div.children.length > 0) {
        rootNode.appendChild(div.children[0]);
      }

      return rootNode;
    }

    function parentHasClass(startingElement, className, depth) {

      var last  = startingElement;

      for (var i=0; (depth||10) > i && last; i++) {

        if (last && last.className && last.className.indexOf(className) > -1) {
          return last;
        }

        last = last.parentNode;

      }

      return null;
    }

    function processTemplate(template, data) {

        Object.keys(data).forEach(function(key) {

          template = template.split("{" + key + "}").join(data[key]);

        });

        return template;

    }

    function promptUserForLayerData(buttonNode, callback) {

      var inputFormNode = buttonNode.parentNode.querySelector(".input-form");

      //
      // Add input form for this menu group if it
      // does not already exist
      //
      if (!inputFormNode) {
        append(buttonNode.parentNode, processTemplate(inputFormTemplate, {
          "layerid" : buttonNode.getAttribute("data-for")
        }));
        inputFormNode = buttonNode.parentNode.querySelector(".input-form");

        inputFormNode.querySelector("button").addEventListener("click", function(e) {

          e.preventDefault();

          e.target.parentNode.parentNode.classList.add("hidden");

          if (typeof callback === "function") {
            callback();
          }

        }, false);
      }

      //
      // Show the form
      //
      inputFormNode.classList.remove("hidden");
    }

    function getLayerNode(layer) {
      return rootNode.querySelector(".layer-item-" + layer.id);
    }

    // target elements with the "draggable" class
    interact(".draggable")
    .draggable(dragConfig).allowFrom(".grab").dropzone(dropConfig);

    // target elements with the "draggable" class
    interact(".draggable-2")
    .draggable(dragConfig).allowFrom(".grab").dropzone(dropConfig).dropzone(dropConfig);

    interact(".dropzone1").dropzone(dropConfig);

    interact(".dropzone2").dropzone(dropConfig);

    interact(".dropzone3").dropzone(dropConfig);

    var actions = document.querySelectorAll(".add-action");

    function onClick(e) {
        promptUserForLayerData(e.target, function() {
          var formNode = e.target.parentNode.querySelector("form"),
              layerId  = e.target.getAttribute("data-for") + formNode["label"].value.toLowerCase().replace(/\s/g,"&");

          append(
            document.querySelector("." + e.target.getAttribute("data-for")),
            processTemplate(layerTemplate, {
              "label" : formNode["label"].value,
              "id"    : layerId
            })
          );

          that.fire("layerAdded", {
            "list"  : e.target.getAttribute("data-for"),
            "label" : formNode["label"].value,
            "uri"   : formNode["uri"].value,
            "id"    : layerId
          });
        });
    }

    for (var i=0; actions.length > i; i++) {
      actions[i].addEventListener("click", onClick);
    }

    //
    // Public interface
    //
    that.getLayerNode = getLayerNode;

    return that;

  }

  //
  // Make available to STMN namespace
  //
  if (typeof window.STMN !== "object") {
    window.STMN = {};
  }

  window.STMN.LegendLayerMenu = STPX.samesies.extend(LegendLayerMenu);

  //
  // Make available to CommonJS
  //
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = STMN.LegendLayerMenu;

  // Make available to AMD module
  } else if (typeof define === "function" && define.amd) {
    define(STMN.LegendLayerMenu);
  }
}());

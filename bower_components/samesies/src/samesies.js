(function() {
  "use strict";

  var listeners = {},
      data      = {};

  var interfaceMethods = {

    "on" : function on(type, callback, data, once) {
      if (!listeners[type]) {
        listeners[type] = [];
      }

      listeners[type].push(arguments);
    },

    //
    // Just like on but it unsubscribes after one fire
    //
    "once" : function once(type, callback, data) {
      return this.on.apply(this, [
        arguments[0],
        arguments[1],
        arguments[2],
        true
        ]);
      },

      //
      // Fire an event and run all subscribers
      //
      "fire" : function fire(type, data) {
        if(listeners[type]) {
          listeners[type].forEach(function(listener) {
            listener[1]({
              listener : listener[2],
              caller   : data
            });
          });

          listeners[type] = listeners[type].filter(function(p) {return !p[3];});
        }
      },

      //
      // Gets a value by key
      //
      "get" : function get(key) {

        this.fire("get:" + key, {
          "value" : data[key]
        });

        this.fire("get", {
          "value" : data[key],
          "key"   : key
        });

        return data[key];

      },

      //
      // Sets a value by key
      //
      "set" : function get(key, value) {

        var old = data[key];

        data[key] = value;

        this.fire("set:" + key, {
          "value" : data[key]
        });

        this.fire("set", {
          "value"    : data[key],
          "oldValue" : old,
          "key"      : key
        });

        return data[key];

      }
    };

    var samesies = {
      "mix" : function (object) {
        for (var i in interfaceMethods) {
          object[i] = interfaceMethods[i];
        }

        return object;
      },
      "extend" : function (instance) {

        for (var i in interfaceMethods) {
          instance.prototype[i] = interfaceMethods[i];
        }

        return instance;
      }
    };

    //
    // If this is a CommonJS module
    //
    if (typeof module === "object" && module.exports) {
      module.exports = samesies;
    }

    //
    // If this is an AMD module
    //
    if (typeof define === "function") {
      define(samesies);
    }

    //
    // If just exports and it's an object
    //
    if (typeof module !== "object" && typeof exports === "object") {
      exports.samesies = samesies;
    }

    //
    // If none of those, add it to Window (as long as there is nothing named samesies)
    //
    if (typeof define !== "function" && typeof window === "object") {
      if (!window.STPX) {
        window.STPX = {};
      }
      window.STPX.samesies = samesies;
    }
}());

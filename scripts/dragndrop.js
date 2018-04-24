"use strict";

var DnD = (function () {
  var initialized = false;
  var Hammer = window.Hammer;

  if (!Hammer) {
    console.error('HammerJs 2.0.8 needs to be loaded befor dragNdrop');
    return;
  }

  var ticking = false;
  //placeholder for the element that is currently moving
  var currentMovingElement = null;

  //polifill for browsers that don't support requestAnimationFrame
  var reqAnimationFrame = (function () {
    return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  var classPrefix = '.';

  //default class names that will be used if the user doesn't provide them via a config object
  var droppingIndicators = {
    dropItemSelector: 'drop-item',
    dropItemContainerSelector: 'drop-item-container',
    dropItemPlaceholderSelector: 'drop-item-placeholder',
    animationSelector: 'animate',
    movingSelector: 'moving'
  };

  //placeholder variable for the transformation style values
  var transform = {};

  //a public function that handles the plugin initialisazion
  var init = function (config) {
    //preventing multiple calling of init() and with it, unnecessary event bing and hammer manager instances
    if (initialized) {
      console.log("You can't initialize this module twice. Use registerAdditionalDropItems instead.");
      return;
    }

    //if a config is provided, the values will override the default values in droppingIndicators, which in turn is used internally
    if (config) {
      mapDropIndicatorClasses(config, droppingIndicators);
    }
    //get all movable items
    var itemsToWrap = document.querySelectorAll(classPrefix.concat(droppingIndicators.dropItemSelector));

    //wrap all movable items
    wrapDropItems(itemsToWrap);
    //the name says it all
    bindListeners(droppingIndicators);
    initialized = true;
  };

  //public method that takes an array of nodes. It's used to bind dynamically the grag and drop features on dynamically added nodes
  var registerAdditionalDropItems = function (newlyAddedItemsArray) {
    wrapDropItems(newlyAddedItems);
    registerHammers(newlyAddedItems);
  };

  //wraps nodes with other nodes
  function wrap(toBeWrapped, wrapper) {
    toBeWrapped.parentNode.insertBefore(wrapper, toBeWrapped);
    wrapper.appendChild(toBeWrapped);
  }

  //wrapps a collection of items with a div that has a defined classname.
  function wrapDropItems(itemsToWrapArray) {
    for (var i = 0; i < itemsToWrapArray.length; i++) {
      var current = itemsToWrapArray[i];
      var wrapper = document.createElement('div');

      wrapper.classList.add(droppingIndicators.dropItemPlaceholderSelector);
      wrap(current, wrapper);
    }
  }

  //bind hammer events on all dropItems
  function registerHammers(dropItems) {
    for (var i = 0; i < dropItems.length; i++) {
      var current = dropItems[i];
      var hammerManager = new Hammer.Manager(current);

      hammerManager.add(new Hammer.Pan({
        threshold: 0,
        pointers: 0
      }));

      hammerManager.on("panstart panmove", onPan);
      hammerManager.on("hammer.input", function (e) {
        //hammer can be a piece of shit sometimes
        if (e.isFinal) {
          onRelease(e);
        }
      });
    }
  }

  //the name again...
  function onRelease(e) {
    //gets the item under the center of the moving item. If it's not a drop-item-container, null will be returned
    var dropContainer = getDropContainerUnderDroppin(e);

    //if its a drop-item-container, take the moving item out of the current container and move it to the new container. Otherwise put it back where it came from.
    if (dropContainer) {
      moveItemToNewContainer(e, dropContainer);
    } else {
      resetCurrentMovingElement();
    }
  }

  //it does what it says
  function bindListeners(droppingIndicators) {
    var dropItems = document.querySelectorAll(classPrefix.concat(droppingIndicators._dropItemSelector));
    registerHammers(dropItems);
  }

  //it does what it says
  function moveItemToNewContainer(ev, dropContainer) {
    var itemToBeMoved = ev.target.parentElement.parentNode.removeChild(ev.target.parentElement);
    dropContainer.appendChild(itemToBeMoved);
    resetCurrentMovingElement();
  }

  //it does what it says. But it takes the centerpoint of the moving item as a reference.
  function getDropContainerUnderDroppin(ev) {
    var rect = ev.target.getBoundingClientRect();
    var x = rect.x + rect.width / 2;
    var y = rect.y + rect.height / 2;

    var elementOnPoint = document.elementFromPoint(x, y) || null;

    if (elementOnPoint !== null && elementOnPoint.classList.toString().indexOf(droppingIndicators.dropItemContainerSelector) > -1) {
      return elementOnPoint;
    } else {
      return null;
    }
  }
  //puts the moving item to where it came from.
  function resetCurrentMovingElement() {
    if (currentMovingElement) {
      currentMovingElement.classList.add(droppingIndicators.animationSelector);
      currentMovingElement.classList.remove(droppingIndicators.movingSelector);

      currentMovingElement.style.removeProperty('webkitTransform');
      currentMovingElement.style.removeProperty('mozTransform');
      currentMovingElement.style.removeProperty('transform');
      currentMovingElement = null;
    }

    ticking = false;
  }
  //keeps the item attached to the cursor while moving.
  function onPan(ev) {
    var current = ev.target;

    current.classList.remove(droppingIndicators.animationSelector);
    current.classList.add(droppingIndicators.movingSelector);

    transform.translate = {
      x: ev.deltaX,
      y: ev.deltaY
    };

    currentMovingElement = ev.target;
    requestElementUpdate();
  }

  //overrides the internal classnames with the ones that the user provided
  function mapDropIndicatorClasses(config, indicators) {
    config.dropItemSelector && (indicators._dropItemSelector = config.dropItemSelector);
    config.dropItemContainerClass && (indicators._dropItemContainerSelector = config.dropItemContainerClass);
    config.dropItemPlaceholder && (indicators._dropItemPlaceholder = config.dropItemContainerClass);
  }

  //it does what it says
  function requestElementUpdate() {
    if (!ticking && currentMovingElement !== null) {
      reqAnimationFrame(updateElementTransform);
      ticking = true;
    }
  }

  //adding a translate3d style to the moving item.
  function updateElementTransform() {
    if (currentMovingElement) {
      var value = [
        'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'
      ];

      value = value.join(" ");
      currentMovingElement.style.webkitTransform = value;
      currentMovingElement.style.mozTransform = value;
      currentMovingElement.style.transform = value;
      ticking = false;
    }
  }
  //public methods.
  return {
    init: init,
    registerAdditionalDropItems: registerAdditionalDropItems
  };
});

function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != 'loading') callback();
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function () {
    if (document.readyState == 'complete') callback();
  });
}

ready(function () {
  var config = {
    dropItemSelector: 'drop-item',
    dropItemContainerSelector: 'drop-item-container',
    dropItemPlaceholder: 'drop-item-placeholder',
  }

  var dragndrop = DnD();
  dragndrop.init(config)

});
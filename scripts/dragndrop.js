"use strict";

var DnD = (function ($) {
    var initialized = false
    var $ = $ || jQuery;
    var Hammer = window.Hammer;
    var ticking = false;

    var currentMovingElement = null;

    var reqAnimationFrame = (function () {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    var droppingIndicators = {
        _dropItemSelector: 'drop-item',
        _dropItemContainerSelector: 'drop-item-container',
        _dropItemPlaceholderSelector: 'drop-item-placeholder',
        _animationSelector: 'animate',
        _movingSelector: 'moving'
    }
    
    var transform = {
        translate: { x: 0, y: 0 }        
    };

    var userConfig = null;

    var _init = function(config) {
        if(initialized) {
            console.log("You can't initialize this module twice.");
            return;
        }

        if(config) {
            userConfig = config;
            mapDropIndicatorClasses(config, droppingIndicators);            
        }

        var $itemsToWrap = $('.' + droppingIndicators._dropItemSelector);
        wrapDropItems($itemsToWrap);
        bindListeners(droppingIndicators);
        initialized = true;
    }

    var _registerAdditionalDropItems = function(newlyAddedItems) {        
        wrapDropItems(newlyAddedItems);
        registerHammers(newlyAddedItems);
    }

    function wrapDropItems($itemsToWrap) {
        for(var i = 0; i < $itemsToWrap.length; i++) {
            var current = $itemsToWrap[i];

            $(current).wrap('<div class="'+ droppingIndicators._dropItemPlaceholderSelector +'"></div>');
        }
    }

    function registerHammers(dropItems) {
        for(var i = 0; i < dropItems.length; i++) {
            var current = dropItems[i];
            var hammerManager = new Hammer.Manager(current);

            hammerManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
            hammerManager.add(new Hammer.Swipe()).recognizeWith(hammerManager.get('pan'));
            hammerManager.on("panstart panmove", onPan);
            hammerManager.on("hammer.input", function(ev) {
                if(ev.isFinal) {
                    var dropContainer = getDropContainerUnderDroppin(ev);
                    
                    if(dropContainer) {
                        moveItemToNewContainer(ev, dropContainer);
                    } else {
                        resetElement(ev);
                    }
                }
            });
        }
    }

    function bindListeners(droppingIndicators) {
        var dropItems = document.querySelectorAll('.' + droppingIndicators._dropItemSelector);        
        registerHammers(dropItems);
    }

    function moveItemToNewContainer(ev, dropContainer) {
        var itemToBeMoved = $(ev.target.parentElement).detach();
        dropContainer.append(itemToBeMoved[0]);
        resetElement(ev);
    }

    function getDropContainerUnderDroppin(ev) {
        var rect = ev.target.getBoundingClientRect();
        var x = rect.x + rect.width / 2;
        var y = rect.y + rect.height / 2;
        
        var elementOnPoint = document.elementFromPoint(x, y) || null;

        if(elementOnPoint !== null && elementOnPoint.classList.toString().indexOf(droppingIndicators._dropItemContainerSelector) > -1){
            return elementOnPoint
        } else {
            return null;
        }
    }
    
    function drawDebugCross(x,y) {
        var bodyHasDebug = $('#horizontal').length > 0 && $('#vertical').length > 0;
        
        if(!bodyHasDebug) {
            var horizontal = $( '<div id="horizontal" style="height: 1px; width: 5000px; background-color: red; position: absolute;" />' )
            var vertical = $( '<div id="vertical" style="height: 5000px; width: 1px; background-color: red; position: absolute;" />' )
            
            $('body').append(horizontal)
            $('body').append(vertical)
        }else {
            $('#horizontal').css('top', y)
            $('#vertical').css('left', x)
        }

        console.log('x: '+ x)
        console.log('y: '+ y)

        $('#horizontal').css({
            'top':  y,
            'left': 0
        })
        $('#vertical').css({
            'left': x,
            'top': 0
        })
    }

    function resetElement(ev) {
        var current = $(currentMovingElement);

        if(current.length) {
            current.addClass(droppingIndicators._animationSelector);
            current.removeClass(droppingIndicators._movingSelector);

            currentMovingElement.style.removeProperty('webkitTransform');
            currentMovingElement.style.removeProperty('mozTransform');
            currentMovingElement.style.removeProperty('transform');
            currentMovingElement = null;
        }

	    ticking = false;       
    }

    function onPan(ev) {
        var current = $(ev.target);

        current.removeClass(droppingIndicators._animationSelector);
        current.addClass(droppingIndicators._movingSelector);

        transform.translate = {
	        x: ev.deltaX,
	        y: ev.deltaY
        };
                                               
        currentMovingElement = ev.target;
        requestElementUpdate();
    }

    function mapDropIndicatorClasses(config, indicators) {
        config.dropItemSelector && (indicators._dropItemSelector = config.dropItemSelector);
        config.dropItemContainerClass && (indicators._dropItemContainerSelector = config.dropItemContainerClass);
        config.dropItemPlaceholder && (indicators._dropItemPlaceholder = config.dropItemContainerClass);
        
    }

    function requestElementUpdate() {
	    if(!ticking && currentMovingElement !== null) {
	        reqAnimationFrame(updateElementTransform);
	        ticking = true;
	    }
	}

    function updateElementTransform() {
        if(currentMovingElement) {
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
    
    return {
        init: _init,
        registerAdditionalDropItems: _registerAdditionalDropItems
    };
});

var config = {
    dropItemSelector: 'drop-item',
    dropItemContainerSelector: 'drop-item-container',
    dropItemPlaceholder: 'drop-item-placeholder',
}

var dragndrop = DnD();
$(document).ready(function() {
    
    dragndrop.init(config)

});
import toggle from '../../helpers/toggler';
import controller from '../../helpers/controller';
import viewport from '../../helpers/viewport';
import {addClass, removeClass} from '../../helpers/classList';

function NavigationBar(el, options) {
  const navigationItems = el.querySelectorAll('.js-navigation-item');
  const overflowList = el.querySelector('.js-overflow-list')
  const overflowItems = el.querySelectorAll('.js-overflow-item');
  const croppedClass = 'NavigationBar--cropped';
  let isOutOfBounds = false;

  function init() {
    bindEvents();
    update();
  }

  function bindEvents() {
    viewport.onResize(update);
  }

  function update() {
    const bounds = el.getBoundingClientRect();
    isOutOfBounds = false;
    Array.prototype.forEach.call(navigationItems, (item, index) => {
      const itembound = item.getBoundingClientRect();

      if (itembound.top > bounds.top) {
        overflowItems[index].setAttribute('aria-hidden', 'false');
        isOutOfBounds = true;
      } else {
        overflowItems[index].setAttribute('aria-hidden', 'true');
      }
    });

    if (isOutOfBounds) {
      addClass(el, croppedClass);
    } else {
      removeClass(el, croppedClass);
    }
  }

  return {
    init,
  };
};

controller.add('NavigationBar', NavigationBar);
// (function(){
//   'use strict';
//
//   var Mediator = require('modules/mediator');
//   var UIEvents = require('modules/ui-events');
//   var getBoundsForElement = require('helpers/get-bounds-for-element');
//   var $ = require('jquery');
//   var _ = require('underscore');
//
//   /** Configuration **/
//   var itemSelector = '.NavigationBar-item';
//   var croppedClass = 'NavigationBar--cropped';
//
//   /** Templates **/
//   var overflowListTemplate = require('templates/main-navigation/overflow-list.html');
//
//   /**
//    * MainNavigation Class Definition
//    */
//   var MainNavigation = function($el) {
//     $el = this.$el = $($el);
//
//     this.init();
//
//     return this;
//   };
//   MainNavigation.prototype = {
//     /** State **/
//     bounds: { top: 0, left: 0, bottom: 0, right: 0 },
//
//     /** Initialization **/
//     init: function() {
//       var $el = this.$el;
//
//       // Bind event handlers
//       _.bindAll(this, 'resizeHandler');
//
//       // Find elements
//       var $items = this.$items = $el.find(itemSelector);
//
//       // Create the overflow list
//       var $overflowList = this.$overflowList = $(overflowListTemplate());
//
//       // Clone the items and add to the overflow list
//       var $overflowItems = this.$overflowItems = $items.clone();
//       $overflowItems.appendTo($overflowList);
//
//       // Append the overflow list
//       $overflowList.appendTo($el);
//
//       // Bind events
//       UIEvents.on('resize', this.resizeHandler);
//
//       // Initial render
//       this.setBounds();
//       this.render();
//     },
//
//     /**
//      * Resize event handler
//      */
//     resizeHandler: function() {
//       this.setBounds();
//       this.render();
//     },
//
//     /**
//      * Check the element's dimensions and store the results
//      */
//     setBounds: function() {
//       return (this.bounds = getBoundsForElement(this.$el));
//     },
//
//     /**
//      * Check if items are visible, and show/hide them in the
//      * overflow list accordingly + set cropped class
//      */
//     render: function() {
//       var $el = this.$el;
//       var $items = this.$items;
//       var $overflowList = this.$overflowList;
//       var $overflowItems = this.$overflowItems;
//       var bounds = this.bounds;
//
//       // First, hide the overflow list in order to not spam document renders
//       $overflowList.css('visibility', 'hidden');
//
//       // Loop through the items and see if they fall outside the main navigation
//       var invisibleCount = 0;
//       var $item, $overflowItem, itemBounds, isVisible;
//       $items.each(function(index, item) {
//         $item = $(item);
//         $overflowItem = $overflowItems.slice(index, index+1);
//         itemBounds = getBoundsForElement($item);
//         isVisible = true;
//
//         if ((itemBounds.bottom > bounds.bottom)) {
//           isVisible = false;
//           invisibleCount += 1;
//         }
//
//         $overflowItem[isVisible ? 'hide' : 'show']();
//       });
//
//       // Show the overflow list again
//       $overflowList.css('visibility', '');
//
//       // Toggle cropped class on or off based on if there are any items that have fallen outside
//       $el.toggleClass(croppedClass, invisibleCount > 0);
//     }
//   };
//
//   /** Expose interface **/
//   module.exports = MainNavigation;
// })();

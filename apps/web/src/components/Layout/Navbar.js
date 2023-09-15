import React, { useEffect, useRef, useState } from 'react';
import { HiBars3 } from 'react-icons/hi2';
import { Branding } from './Branding';
import { Navigation } from './Navigation';
export var Navbar = function () {
  var dropdownRef = useRef(null);
  var _a = useState(false),
    isOpen = _a[0],
    setIsOpen = _a[1];
  var _b = useState(0),
    dropdownHeight = _b[0],
    setDropdownHeight = _b[1];
  useEffect(
    function () {
      if (dropdownRef.current) {
        var sum_1 = 0;
        Array.from(dropdownRef.current.childNodes).forEach(function (node) {
          if (node instanceof HTMLElement) {
            sum_1 += node.offsetHeight;
          }
        });
        setDropdownHeight(sum_1);
      }
    },
    [isOpen]
  );
  return React.createElement(
    'div',
    { className: 'flex flex-col bg-slate-900 px-2 text-slate-300 duration-700' },
    React.createElement(
      'div',
      { className: 'flex w-full justify-between py-2' },
      React.createElement(Branding, null),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: function () {
            setIsOpen(!isOpen);
          }
        },
        React.createElement(HiBars3, { className: 'h-9 w-9' })
      )
    ),
    React.createElement(
      'div',
      {
        className: 'overflow-hidden transition-all duration-500',
        ref: dropdownRef,
        style: { height: isOpen ? dropdownHeight : 0 }
      },
      React.createElement(
        'div',
        { className: 'border-spacing-2 border-t py-2' },
        React.createElement(Navigation, {
          onClick: function () {
            setIsOpen(false);
          }
        })
      )
    )
  );
};

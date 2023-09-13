import React, { useEffect } from 'react';
import { Card } from '@douglasneuroinformatics/ui';
import { motion, useSpring, useTransform } from 'framer-motion';
export var StatisticCard = function (_a) {
  var label = _a.label,
    icon = _a.icon,
    value = _a.value;
  var spring = useSpring(0, { bounce: 0 });
  var rounded = useTransform(spring, function (latest) {
    return Math.floor(latest);
  });
  useEffect(
    function () {
      spring.set(value);
    },
    [spring, value]
  );
  return React.createElement(
    Card,
    { className: 'flex w-full rounded-lg p-4' },
    icon && React.createElement('div', { className: 'mr-2 flex items-center justify-center text-5xl' }, icon),
    React.createElement(
      'div',
      { className: 'w-full' },
      React.createElement(
        motion.h3,
        { className: 'title-font text-3xl font-medium text-slate-900 dark:text-slate-100 sm:text-4xl' },
        rounded
      ),
      React.createElement('p', { className: 'leading-relaxed' }, label)
    )
  );
};

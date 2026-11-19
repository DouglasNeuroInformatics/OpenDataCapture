import { classNameComposition } from '../class-name-composition.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('class-name-composition', classNameComposition, {
  invalid: [
    { code: 'cn(className, "p-2");', errors: [{ messageId: 'last' }] },
    { code: 'cn(props.className, "p-2");', errors: [{ messageId: 'last' }] },
    { code: '<div className={`p-2 ${size}`} />;', errors: [{ messageId: 'compose' }] },
    { code: '<div className={"p-2 " + size} />;', errors: [{ messageId: 'compose' }] }
  ],
  valid: [
    'cn("p-2", className);',
    'cn(props[className], "p-2");',
    'cn(other.className, "p-2");',
    'cn(props.other, "p-2");',
    'cn(value, "p-2");',
    'merge(className, "p-2");',
    'object.cn(className, "p-2");',
    '<div className={cn("p-2", size)} />;',
    '<div className={"p-2" - size} />;',
    '<div className="p-2" />;',
    '<div style={`p-2 ${size}`} />;',
    '<svg xlink:href={`#${id}`} />;'
  ]
});

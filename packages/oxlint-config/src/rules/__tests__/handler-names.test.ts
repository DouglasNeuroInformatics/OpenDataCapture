import { handlerNames } from '../handler-names.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('handler-names', handlerNames, {
  invalid: [
    {
      code: 'function save() {}\n<button onClick={save} />;',
      errors: [{ data: { handler: 'save', prop: 'onClick' }, messageId: 'handler' }]
    },
    { code: 'const save = () => {};\n<button onClick={save} />;', errors: [{ messageId: 'handler' }] },
    { code: 'const save = function () {};\n<button onClick={save} />;', errors: [{ messageId: 'handler' }] },
    { code: 'const save = useCallback(() => {}, []);\n<button onClick={save} />;', errors: [{ messageId: 'handler' }] },
    {
      code: 'const save = React.useCallback(() => {}, []);\n<button onClick={save} />;',
      errors: [{ messageId: 'handler' }]
    },
    {
      code: 'class A { #useCallback; f() { const save = this.#useCallback(); return <b onClick={save} />; } }',
      errors: [{ messageId: 'handler' }]
    },
    {
      code: 'const save = () => {};\nconst Form = () => <button onClick={save} />;',
      errors: [{ messageId: 'handler' }]
    }
  ],
  valid: [
    'const handleSave = () => {};\n<button onClick={handleSave} />;',
    'const [value, setValue] = useState();\n<input onChange={setValue} />;',
    '<button onClick={save} />;',
    'import { save } from "./save";\n<button onClick={save} />;',
    'const save = createSaver();\n<button onClick={save} />;',
    'const save = useMemo(() => () => {}, []);\n<button onClick={save} />;',
    'const { save } = actions;\n<button onClick={save} />;',
    'let save;\n<button onClick={save} />;',
    'const save = () => {};\n<button title={save} />;',
    'const save = () => {};\n<button onClick={() => save()} />;',
    '<button onClick />;',
    '<button on:click={save} />;'
  ]
});

import type { KeyMapping } from './types';

export let defaultKeymap: KeyMapping[] = [
  // Key to key mapping. This goes first to make it possible to override
  // existing mappings.
  { keys: '<Left>', toKeys: 'h', type: 'keyToKey' },
  { keys: '<Right>', toKeys: 'l', type: 'keyToKey' },
  { keys: '<Up>', toKeys: 'k', type: 'keyToKey' },
  { keys: '<Down>', toKeys: 'j', type: 'keyToKey' },
  { keys: 'g<Up>', toKeys: 'gk', type: 'keyToKey' },
  { keys: 'g<Down>', toKeys: 'gj', type: 'keyToKey' },
  { keys: '<Space>', toKeys: 'l', type: 'keyToKey' },
  { context: 'normal', keys: '<BS>', toKeys: 'h', type: 'keyToKey' },
  { context: 'normal', keys: '<Del>', toKeys: 'x', type: 'keyToKey' },
  { keys: '<C-Space>', toKeys: 'W', type: 'keyToKey' },
  { context: 'normal', keys: '<C-BS>', toKeys: 'B', type: 'keyToKey' },
  { keys: '<S-Space>', toKeys: 'w', type: 'keyToKey' },
  { context: 'normal', keys: '<S-BS>', toKeys: 'b', type: 'keyToKey' },
  { keys: '<C-n>', toKeys: 'j', type: 'keyToKey' },
  { keys: '<C-p>', toKeys: 'k', type: 'keyToKey' },
  { keys: '<C-[>', toKeys: '<Esc>', type: 'keyToKey' },
  { keys: '<C-c>', toKeys: '<Esc>', type: 'keyToKey' },
  { context: 'insert', keys: '<C-[>', toKeys: '<Esc>', type: 'keyToKey' },
  { context: 'insert', keys: '<C-c>', toKeys: '<Esc>', type: 'keyToKey' },
  { context: 'normal', keys: 's', toKeys: 'cl', type: 'keyToKey' },
  { context: 'visual', keys: 's', toKeys: 'c', type: 'keyToKey' },
  { context: 'normal', keys: 'S', toKeys: 'cc', type: 'keyToKey' },
  { context: 'visual', keys: 'S', toKeys: 'VdO', type: 'keyToKey' },
  { keys: '<Home>', toKeys: '0', type: 'keyToKey' },
  { keys: '<End>', toKeys: '$', type: 'keyToKey' },
  { keys: '<PageUp>', toKeys: '<C-b>', type: 'keyToKey' },
  { keys: '<PageDown>', toKeys: '<C-f>', type: 'keyToKey' },
  { context: 'normal', keys: '<CR>', toKeys: 'j^', type: 'keyToKey' },
  { context: 'normal', keys: '<Ins>', toKeys: 'i', type: 'keyToKey' },
  {
    action: 'toggleOverwrite',
    context: 'insert',
    keys: '<Ins>',
    type: 'action'
  },
  // Motions
  {
    keys: 'H',
    motion: 'moveToTopLine',
    motionArgs: { linewise: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: 'M',
    motion: 'moveToMiddleLine',
    motionArgs: { linewise: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: 'L',
    motion: 'moveToBottomLine',
    motionArgs: { linewise: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: 'h',
    motion: 'moveByCharacters',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: 'l',
    motion: 'moveByCharacters',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: 'j',
    motion: 'moveByLines',
    motionArgs: { forward: true, linewise: true },
    type: 'motion'
  },
  {
    keys: 'k',
    motion: 'moveByLines',
    motionArgs: { forward: false, linewise: true },
    type: 'motion'
  },
  {
    keys: 'gj',
    motion: 'moveByDisplayLines',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: 'gk',
    motion: 'moveByDisplayLines',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: 'w',
    motion: 'moveByWords',
    motionArgs: { forward: true, wordEnd: false },
    type: 'motion'
  },
  {
    keys: 'W',
    motion: 'moveByWords',
    motionArgs: { bigWord: true, forward: true, wordEnd: false },
    type: 'motion'
  },
  {
    keys: 'e',
    motion: 'moveByWords',
    motionArgs: { forward: true, inclusive: true, wordEnd: true },
    type: 'motion'
  },
  {
    keys: 'E',
    motion: 'moveByWords',
    motionArgs: {
      bigWord: true,
      forward: true,
      inclusive: true,
      wordEnd: true
    },
    type: 'motion'
  },
  {
    keys: 'b',
    motion: 'moveByWords',
    motionArgs: { forward: false, wordEnd: false },
    type: 'motion'
  },
  {
    keys: 'B',
    motion: 'moveByWords',
    motionArgs: { bigWord: true, forward: false, wordEnd: false },
    type: 'motion'
  },
  {
    keys: 'ge',
    motion: 'moveByWords',
    motionArgs: { forward: false, inclusive: true, wordEnd: true },
    type: 'motion'
  },
  {
    keys: 'gE',
    motion: 'moveByWords',
    motionArgs: {
      bigWord: true,
      forward: false,
      inclusive: true,
      wordEnd: true
    },
    type: 'motion'
  },
  {
    keys: '{',
    motion: 'moveByParagraph',
    motionArgs: { forward: false, toJumplist: true },
    type: 'motion'
  },
  {
    keys: '}',
    motion: 'moveByParagraph',
    motionArgs: { forward: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: '(',
    motion: 'moveBySentence',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: ')',
    motion: 'moveBySentence',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: '<C-f>',
    motion: 'moveByPage',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: '<C-b>',
    motion: 'moveByPage',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: '<C-d>',
    motion: 'moveByScroll',
    motionArgs: { explicitRepeat: true, forward: true },
    type: 'motion'
  },
  {
    keys: '<C-u>',
    motion: 'moveByScroll',
    motionArgs: { explicitRepeat: true, forward: false },
    type: 'motion'
  },
  {
    keys: 'gg',
    motion: 'moveToLineOrEdgeOfDocument',
    motionArgs: {
      explicitRepeat: true,
      forward: false,
      linewise: true,
      toJumplist: true
    },
    type: 'motion'
  },
  {
    keys: 'G',
    motion: 'moveToLineOrEdgeOfDocument',
    motionArgs: {
      explicitRepeat: true,
      forward: true,
      linewise: true,
      toJumplist: true
    },
    type: 'motion'
  },
  { keys: 'g$', motion: 'moveToEndOfDisplayLine', type: 'motion' },
  { keys: 'g^', motion: 'moveToStartOfDisplayLine', type: 'motion' },
  { keys: 'g0', motion: 'moveToStartOfDisplayLine', type: 'motion' },
  { keys: '0', motion: 'moveToStartOfLine', type: 'motion' },
  { keys: '^', motion: 'moveToFirstNonWhiteSpaceCharacter', type: 'motion' },
  {
    keys: '+',
    motion: 'moveByLines',
    motionArgs: { forward: true, toFirstChar: true },
    type: 'motion'
  },
  {
    keys: '-',
    motion: 'moveByLines',
    motionArgs: { forward: false, toFirstChar: true },
    type: 'motion'
  },
  {
    keys: '_',
    motion: 'moveByLines',
    motionArgs: { forward: true, repeatOffset: -1, toFirstChar: true },
    type: 'motion'
  },
  {
    keys: '$',
    motion: 'moveToEol',
    motionArgs: { inclusive: true },
    type: 'motion'
  },
  {
    keys: '%',
    motion: 'moveToMatchedSymbol',
    motionArgs: { inclusive: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: 'f<character>',
    motion: 'moveToCharacter',
    motionArgs: { forward: true, inclusive: true },
    type: 'motion'
  },
  {
    keys: 'F<character>',
    motion: 'moveToCharacter',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: 't<character>',
    motion: 'moveTillCharacter',
    motionArgs: { forward: true, inclusive: true },
    type: 'motion'
  },
  {
    keys: 'T<character>',
    motion: 'moveTillCharacter',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: ';',
    motion: 'repeatLastCharacterSearch',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: ',',
    motion: 'repeatLastCharacterSearch',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: "'<character>",
    motion: 'goToMark',
    motionArgs: { linewise: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: '`<character>',
    motion: 'goToMark',
    motionArgs: { toJumplist: true },
    type: 'motion'
  },
  {
    keys: ']`',
    motion: 'jumpToMark',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: '[`',
    motion: 'jumpToMark',
    motionArgs: { forward: false },
    type: 'motion'
  },
  {
    keys: "]'",
    motion: 'jumpToMark',
    motionArgs: { forward: true, linewise: true },
    type: 'motion'
  },
  {
    keys: "['",
    motion: 'jumpToMark',
    motionArgs: { forward: false, linewise: true },
    type: 'motion'
  },
  // the next two aren't motions but must come before more general motion declarations
  {
    action: 'paste',
    actionArgs: { after: true, isEdit: true, matchIndent: true },
    isEdit: true,
    keys: ']p',
    type: 'action'
  },
  {
    action: 'paste',
    actionArgs: { after: false, isEdit: true, matchIndent: true },
    isEdit: true,
    keys: '[p',
    type: 'action'
  },
  {
    keys: ']<character>',
    motion: 'moveToSymbol',
    motionArgs: { forward: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: '[<character>',
    motion: 'moveToSymbol',
    motionArgs: { forward: false, toJumplist: true },
    type: 'motion'
  },
  { keys: '|', motion: 'moveToColumn', type: 'motion' },
  {
    context: 'visual',
    keys: 'o',
    motion: 'moveToOtherHighlightedEnd',
    type: 'motion'
  },
  {
    context: 'visual',
    keys: 'O',
    motion: 'moveToOtherHighlightedEnd',
    motionArgs: { sameLine: true },
    type: 'motion'
  },
  // Operators
  { keys: 'd', operator: 'delete', type: 'operator' },
  { keys: 'y', operator: 'yank', type: 'operator' },
  { keys: 'c', operator: 'change', type: 'operator' },
  { keys: '=', operator: 'indentAuto', type: 'operator' },
  {
    keys: '>',
    operator: 'indent',
    operatorArgs: { indentRight: true },
    type: 'operator'
  },
  {
    keys: '<',
    operator: 'indent',
    operatorArgs: { indentRight: false },
    type: 'operator'
  },
  { keys: 'g~', operator: 'changeCase', type: 'operator' },
  {
    isEdit: true,
    keys: 'gu',
    operator: 'changeCase',
    operatorArgs: { toLower: true },
    type: 'operator'
  },
  {
    isEdit: true,
    keys: 'gU',
    operator: 'changeCase',
    operatorArgs: { toLower: false },
    type: 'operator'
  },
  {
    keys: 'n',
    motion: 'findNext',
    motionArgs: { forward: true, toJumplist: true },
    type: 'motion'
  },
  {
    keys: 'N',
    motion: 'findNext',
    motionArgs: { forward: false, toJumplist: true },
    type: 'motion'
  },
  {
    keys: 'gn',
    motion: 'findAndSelectNextInclusive',
    motionArgs: { forward: true },
    type: 'motion'
  },
  {
    keys: 'gN',
    motion: 'findAndSelectNextInclusive',
    motionArgs: { forward: false },
    type: 'motion'
  },
  // Operator-Motion dual commands
  {
    keys: 'x',
    motion: 'moveByCharacters',
    motionArgs: { forward: true },
    operator: 'delete',
    operatorMotionArgs: { visualLine: false },
    type: 'operatorMotion'
  },
  {
    keys: 'X',
    motion: 'moveByCharacters',
    motionArgs: { forward: false },
    operator: 'delete',
    operatorMotionArgs: { visualLine: true },
    type: 'operatorMotion'
  },
  {
    context: 'normal',
    keys: 'D',
    motion: 'moveToEol',
    motionArgs: { inclusive: true },
    operator: 'delete',
    type: 'operatorMotion'
  },
  {
    context: 'visual',
    keys: 'D',
    operator: 'delete',
    operatorArgs: { linewise: true },
    type: 'operator'
  },
  {
    context: 'normal',
    keys: 'Y',
    motion: 'expandToLine',
    motionArgs: { linewise: true },
    operator: 'yank',
    type: 'operatorMotion'
  },
  {
    context: 'visual',
    keys: 'Y',
    operator: 'yank',
    operatorArgs: { linewise: true },
    type: 'operator'
  },
  {
    context: 'normal',
    keys: 'C',
    motion: 'moveToEol',
    motionArgs: { inclusive: true },
    operator: 'change',
    type: 'operatorMotion'
  },
  {
    context: 'visual',
    keys: 'C',
    operator: 'change',
    operatorArgs: { linewise: true },
    type: 'operator'
  },
  {
    context: 'normal',
    keys: '~',
    motion: 'moveByCharacters',
    motionArgs: { forward: true },
    operator: 'changeCase',
    operatorArgs: { shouldMoveCursor: true },
    type: 'operatorMotion'
  },
  { context: 'visual', keys: '~', operator: 'changeCase', type: 'operator' },
  {
    context: 'insert',
    keys: '<C-u>',
    motion: 'moveToStartOfLine',
    operator: 'delete',
    type: 'operatorMotion'
  },
  {
    context: 'insert',
    keys: '<C-w>',
    motion: 'moveByWords',
    motionArgs: { forward: false, wordEnd: false },
    operator: 'delete',
    type: 'operatorMotion'
  },
  //ignore C-w in normal mode
  { context: 'normal', keys: '<C-w>', type: 'idle' },
  // Actions
  {
    action: 'jumpListWalk',
    actionArgs: { forward: true },
    keys: '<C-i>',
    type: 'action'
  },
  {
    action: 'jumpListWalk',
    actionArgs: { forward: false },
    keys: '<C-o>',
    type: 'action'
  },
  {
    action: 'scroll',
    actionArgs: { forward: true, linewise: true },
    keys: '<C-e>',
    type: 'action'
  },
  {
    action: 'scroll',
    actionArgs: { forward: false, linewise: true },
    keys: '<C-y>',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'charAfter' },
    context: 'normal',
    isEdit: true,
    keys: 'a',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'eol' },
    context: 'normal',
    isEdit: true,
    keys: 'A',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'endOfSelectedArea' },
    context: 'visual',
    isEdit: true,
    keys: 'A',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'inplace' },
    context: 'normal',
    isEdit: true,
    keys: 'i',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'lastEdit' },
    context: 'normal',
    isEdit: true,
    keys: 'gi',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'firstNonBlank' },
    context: 'normal',
    isEdit: true,
    keys: 'I',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'bol' },
    context: 'normal',
    isEdit: true,
    keys: 'gI',
    type: 'action'
  },
  {
    action: 'enterInsertMode',
    actionArgs: { insertAt: 'startOfSelectedArea' },
    context: 'visual',
    isEdit: true,
    keys: 'I',
    type: 'action'
  },
  {
    action: 'newLineAndEnterInsertMode',
    actionArgs: { after: true },
    context: 'normal',
    interlaceInsertRepeat: true,
    isEdit: true,
    keys: 'o',
    type: 'action'
  },
  {
    action: 'newLineAndEnterInsertMode',
    actionArgs: { after: false },
    context: 'normal',
    interlaceInsertRepeat: true,
    isEdit: true,
    keys: 'O',
    type: 'action'
  },
  { action: 'toggleVisualMode', keys: 'v', type: 'action' },
  {
    action: 'toggleVisualMode',
    actionArgs: { linewise: true },
    keys: 'V',
    type: 'action'
  },
  {
    action: 'toggleVisualMode',
    actionArgs: { blockwise: true },
    keys: '<C-v>',
    type: 'action'
  },
  {
    action: 'toggleVisualMode',
    actionArgs: { blockwise: true },
    keys: '<C-q>',
    type: 'action'
  },
  { action: 'reselectLastSelection', keys: 'gv', type: 'action' },
  { action: 'joinLines', isEdit: true, keys: 'J', type: 'action' },
  {
    action: 'joinLines',
    actionArgs: { keepSpaces: true },
    isEdit: true,
    keys: 'gJ',
    type: 'action'
  },
  {
    action: 'paste',
    actionArgs: { after: true, isEdit: true },
    isEdit: true,
    keys: 'p',
    type: 'action'
  },
  {
    action: 'paste',
    actionArgs: { after: false, isEdit: true },
    isEdit: true,
    keys: 'P',
    type: 'action'
  },
  { action: 'replace', isEdit: true, keys: 'r<character>', type: 'action' },
  { action: 'replayMacro', keys: '@<character>', type: 'action' },
  { action: 'enterMacroRecordMode', keys: 'q<character>', type: 'action' },
  // Handle Replace-mode as a special case of insert mode.
  {
    action: 'enterInsertMode',
    actionArgs: { replace: true },
    context: 'normal',
    isEdit: true,
    keys: 'R',
    type: 'action'
  },
  {
    context: 'visual',
    exitVisualBlock: true,
    keys: 'R',
    operator: 'change',
    operatorArgs: { fullLine: true, linewise: true },
    type: 'operator'
  },
  { action: 'undo', context: 'normal', keys: 'u', type: 'action' },
  {
    context: 'visual',
    isEdit: true,
    keys: 'u',
    operator: 'changeCase',
    operatorArgs: { toLower: true },
    type: 'operator'
  },
  {
    context: 'visual',
    isEdit: true,
    keys: 'U',
    operator: 'changeCase',
    operatorArgs: { toLower: false },
    type: 'operator'
  },
  { action: 'redo', keys: '<C-r>', type: 'action' },
  { action: 'setMark', keys: 'm<character>', type: 'action' },
  { action: 'setRegister', keys: '"<character>', type: 'action' },
  {
    action: 'scrollToCursor',
    actionArgs: { position: 'center' },
    keys: 'zz',
    type: 'action'
  },
  {
    action: 'scrollToCursor',
    actionArgs: { position: 'center' },
    keys: 'z.',
    motion: 'moveToFirstNonWhiteSpaceCharacter',
    type: 'action'
  },
  {
    action: 'scrollToCursor',
    actionArgs: { position: 'top' },
    keys: 'zt',
    type: 'action'
  },
  {
    action: 'scrollToCursor',
    actionArgs: { position: 'top' },
    keys: 'z<CR>',
    motion: 'moveToFirstNonWhiteSpaceCharacter',
    type: 'action'
  },
  {
    action: 'scrollToCursor',
    actionArgs: { position: 'bottom' },
    keys: 'z-',
    type: 'action'
  },
  {
    action: 'scrollToCursor',
    actionArgs: { position: 'bottom' },
    keys: 'zb',
    motion: 'moveToFirstNonWhiteSpaceCharacter',
    type: 'action'
  },
  { action: 'repeatLastEdit', keys: '.', type: 'action' },
  {
    action: 'incrementNumberToken',
    actionArgs: { backtrack: false, increase: true },
    isEdit: true,
    keys: '<C-a>',
    type: 'action'
  },
  {
    action: 'incrementNumberToken',
    actionArgs: { backtrack: false, increase: false },
    isEdit: true,
    keys: '<C-x>',
    type: 'action'
  },
  {
    action: 'indent',
    actionArgs: { indentRight: true },
    context: 'insert',
    keys: '<C-t>',
    type: 'action'
  },
  {
    action: 'indent',
    actionArgs: { indentRight: false },
    context: 'insert',
    keys: '<C-d>',
    type: 'action'
  },
  {
    action: 'beginDigraph',
    context: 'insert',
    keys: '<C-k>',
    type: 'action'
  },
  // Text object motions
  { keys: 'a<character>', motion: 'textObjectManipulation', type: 'motion' },
  {
    keys: 'i<character>',
    motion: 'textObjectManipulation',
    motionArgs: { textObjectInner: true },
    type: 'motion'
  },
  // Search
  {
    keys: '/',
    searchArgs: { forward: true, querySrc: 'prompt', toJumplist: true },
    type: 'search'
  },
  {
    keys: '?',
    searchArgs: { forward: false, querySrc: 'prompt', toJumplist: true },
    type: 'search'
  },
  {
    keys: '*',
    searchArgs: {
      forward: true,
      querySrc: 'wordUnderCursor',
      toJumplist: true,
      wholeWordOnly: true
    },
    type: 'search'
  },
  {
    keys: '#',
    searchArgs: {
      forward: false,
      querySrc: 'wordUnderCursor',
      toJumplist: true,
      wholeWordOnly: true
    },
    type: 'search'
  },
  {
    keys: 'g*',
    searchArgs: {
      forward: true,
      querySrc: 'wordUnderCursor',
      toJumplist: true
    },
    type: 'search'
  },
  {
    keys: 'g#',
    searchArgs: {
      forward: false,
      querySrc: 'wordUnderCursor',
      toJumplist: true
    },
    type: 'search'
  },
  // Ex command
  { keys: ':', type: 'ex' }
];

export let defaultKeymapLength = defaultKeymap.length;

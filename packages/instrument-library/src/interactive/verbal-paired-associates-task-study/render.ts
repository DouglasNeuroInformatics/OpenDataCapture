type WordPair = {
  probe: string;
  target: string;
};

type Frame = {
  message: string;
  probe: string;
  target: string;
  type: string;
};

// This was previously a separate file
const inputFile = `*
* This is an input file to the STUDY component of the Verbal Pair Associates Test
* Each line must contain a probe-target pair of words
* The word separator is 'whitespace'
* Lines beginning with '*' are ignored
* PROBE TARGET
officer kettle
animal glass
student couch
cocktail cement
fruit elbow
horse choir
piano walrus
garlic bubble
mirror wallet
guest bread
beverage laundry
candle umbrella
beach mustard
nurse radio
organ lettuce
flame mother
rabbit weapon
shark floor
spoon disease
tourist newspaper
soccer dentist
torch zipper
column tulip
blonde ocean
woman potato`;

export async function render(done: (data: { success: boolean }) => void) {
  const {
    chainTimeouts,
    disableDoubleTapZoom,
    disableDrag,
    disableRightClick,
    disableSelect,
    getID,
    setMobileViewportScale,
    showAlert,
    showFrame
  } = await import('/runtime/v1/testmybrain@12.18.0/index.js');

  const wordPairs: WordPair[] = [];
  let pairsCount = 0; // count of already seen word pairs
  const studyTime = 3000; // probe-target study time
  const ISI = 500; // inter-stimulus interval
  const frameSequence: Frame[] = []; // object containing the sequence of frames and their properties\
  let frame: Frame | undefined; // single frame object
  // let inputFile: string; // url parameter: file containing probe-target word pairs

  function nextTrial() {
    // read the frame sequence one frame at a time
    frame = frameSequence.shift();
    if (frame) {
      // check if it's the startup frame
      if (frame.type === 'begin')
        showAlert(
          frame.message,
          'Click here for instructions',
          function () {
            nextTrial();
          },
          '20pt'
        );
      // else if it's a message frame, show it
      else if (frame.type === 'message')
        showAlert(
          frame.message,
          'Click here to continue',
          function () {
            showFrame('null');
            nextTrial();
          },
          '20pt'
        );
      // deal with test frames
      else {
        chainTimeouts(
          function () {
            pairsCount++;
            getID('counter').innerHTML = '<b>' + pairsCount + ' of ' + wordPairs.length + '</b>';
            showFrame('counter');
          },
          ISI,
          function () {
            getID('test').innerHTML = frame?.probe.toUpperCase() + ' - ' + frame?.target.toUpperCase();
            showFrame('counter', 'test');
          },
          studyTime,
          function () {
            showFrame('null');
            nextTrial();
          }
        );
      }
    }
    // else the sequence is empty, we are done!
    else {
      done({ success: true });
      // tmbSubmitToServer([], null, {});
    }
  }

  function setFrameSequence() {
    // messages
    let testMessage = {
      begin: '<h2>Word Pairs Test</h2>' + 'SKY - BLUE<br><br>',
      end: 'You will be tested on these word pairs shortly.<br>' + "But first, let's do some other tests!<br><br>",
      instructions:
        '<h3>Instructions:</h3>' +
        'SKY - BLUE<br><br>' +
        'You will see ' +
        wordPairs.length +
        ' word pairs, like above.<br>' +
        'Learn which words go together.<br>' +
        'Later you will be tested on that!<br><br>'
    };

    // type of frame to display
    var frameType = ['begin', 'message'];

    // message to display
    var frameMessage = [testMessage.begin, testMessage.instructions];

    // words to display
    var frameProbe = ['', ''];
    var frameTarget = ['', ''];

    for (const wordPair of wordPairs) {
      frameType.push('test');
      frameMessage.push('');
      frameProbe.push(wordPair.probe);
      frameTarget.push(wordPair.target);
    }

    frameType.push('message');
    frameMessage.push(testMessage.end);
    frameProbe.push('');
    frameTarget.push('');

    // push all components into the frames chain
    for (let i = 0; i < frameType.length; i++) {
      frameSequence.push({
        message: frameMessage[i],
        probe: frameProbe[i],
        target: frameTarget[i],
        type: frameType[i]
      });
    }

    // start the trial sequence
    nextTrial();
  }

  // this is the input file's parser: it builds a JSON object
  // from the instructions and material in the file
  function parseFile(text: string) {
    // parse the input file
    if (text) {
      let words = [];
      let errors = 0;

      // Parse the file's text into lines by splitting on 'newline'.
      // (do not use regexp, e.g. /\r?\n/, because ie8 throws up)
      const lines = text.split('\n');

      // parse each line into words by splitting on 'whitespace'
      let i: number;
      for (i = 0; i < lines.length; i++) {
        const line = lines[i];
        // first check if this line is a comment (starts with '*'?)
        if (line.startsWith('*')) continue;

        // split on 'whitespace'
        words = line.split(' ');

        // save probe and target words, or stop and report an error
        if (words.length === 2) wordPairs.push({ probe: words[0], target: words[1] });
        else {
          errors++;
          break;
        }
      }

      if (errors) {
        showAlert('parseFile: Incorrect formatting of words pair ' + (i + 1) + '.<br><br>' + '', null, null, '20pt');
      } else if (wordPairs.length === 0) {
        showAlert("parseFile: Error parsing input file's content.<br><br>" + '', null, null, '20pt');
      } else setFrameSequence();
    } else showAlert('ajaxRequest: Error reading input file.<br><br>' + '', null, null, '20pt');
  }

  const counter = document.createElement('div');
  counter.id = 'counter';
  counter.style.display = 'none';
  document.body.appendChild(counter);

  const test = document.createElement('div');
  test.id = 'test';
  test.style.display = 'none';
  document.body.appendChild(test);

  // specify the input file
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  // inputFile = getUrlParameters('input', '', true) || 'studyInput.txt';

  setMobileViewportScale(700, 500);

  // disable spurious user interaction
  disableSelect();
  disableRightClick();
  disableDrag();
  disableDoubleTapZoom();

  parseFile(inputFile);

  // read the input file and call the parser
  // ajaxRequest({ async: true, callback: parseFile, url: inputFile });
}

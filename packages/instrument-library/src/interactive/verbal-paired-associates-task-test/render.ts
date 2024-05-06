import html from './fragment.html';

type WordPair = {
  choice1?: string;
  choice2?: string;
  choice3?: string;
  choice4?: string;
  probe: string;
  target: string;
};

type Frame = {
  choice1?: string;
  choice2?: string;
  choice3?: string;
  choice4?: string;
  message: string;
  probe: string;
  target: string;
  type: string;
};

type Result = {
  correct: 0 | 1;
  probe: string;
  response: string;
  rt: number;
  state: string;
  target: string;
  type: string;
};

type Outcomes = {
  accuracy: number;
  meanRTc: number;
  medianRTc: number;
  responseDevice: string;
  score: number;
  sdRTc: number;
  testVersion: string;
};

// This was previously in a separate file
const inputFile = `*
* This is an input file to the TEST component of the Verbal Pair Associates Test
* Each line must contain a probe word, its associated target and 4 choice words
* The word separator is 'whitespace'
* Lines beginning with '*' are ignored
* PROBE TARGET CHOICE-1 CHOICE-2 CHOICE-3 CHOICE-4
woman potato potato bread spider closet
student couch lake kettle forest couch
beverage laundry glass paint detective laundry
guest bread elbow lemonade bread family
blonde ocean ocean closet dentist lake
soccer dentist lawyer weapon window dentist
cocktail cement floor cement church family
officer kettle lettuce dollar doctor kettle
beach mustard tunnel ticket bubble mustard
piano walrus forest radio walrus ticket
organ lettuce monkey movie couch lettuce
candle umbrella mother envelope sauce umbrella
spoon disease sauce potato tunnel disease
horse choir ocean choir church envelope
torch zipper disease dress zipper material
garlic bubble bubble newspaper doctor dollar
tourist newspaper window banana newspaper choir
nurse radio spider radio lemonade umbrella
column tulip wallet dress tulip helmet
flame mother mother cousin detective zipper
animal glass glass monkey walrus banana
rabbit weapon rubber laundry lettuce weapon
shark floor floor lawyer tulip helmet
mirror wallet cement wallet movie cousin
fruit elbow mustard paint elbow material`;

export async function render() {
  const {
    chainTimeouts,
    disableDoubleTapZoom,
    disableDrag,
    disableRightClick,
    disableSelect,
    getID,
    getUrlParameters,
    hasPointer,
    hasTouch,
    logResults,
    setMobileViewportScale,
    showAlert,
    showFrame,
    tmbSubmitToFile,
    tmbSubmitToServer,
    tmbUI
  } = await import('/runtime/v1/testmybrain@12.18.0/index.js');

  const testVersion = 'VPA_2019_test.v1.Oct19'; // version identifier for this test
  const wordPairs: WordPair[] = []; // array of probe-target words
  let pairsCount = 0; // count of already seen word pairs
  const ISI = 500; // inter-stimulus interval
  let correct: 0 | 1; // correct=1, wrong=0
  let score = 0; // accumulated score
  const results: Result[] = []; // array to store trials details and responses
  const outcomes: Partial<Outcomes> = {}; // object containing outcome variables
  const frameSequence: Frame[] = []; // object containing the sequence of frames and their properties
  let frame: Frame | undefined; // single frame object
  let debug: string; // URL parameter: output to console
  let showresults: any; // URL parameter: if they want to show results in a popup window
  let autosave: any; // URL parameter: if they want to save data in a file automatically
  let filename: false | string | undefined; // filename for data

  // specify actions to take on user input
  tmbUI.onreadyUI = function () {
    var choice;

    // if we are debugging and there was an error, log the message
    if (debug === 'true' && tmbUI.message) console.log(tmbUI.message);

    // retrieve which word they chose
    if (tmbUI.response) {
      choice = getID(tmbUI.response).innerHTML;
      choice = choice.slice(3).toLowerCase().trim();
    } else choice = 'none';

    // is the response correct?
    correct = choice === frame!.target ? 1 : 0;

    results.push({
      correct: correct, // boolean correct
      probe: frame!.probe, // probe word
      response: choice, // the chosen word
      rt: tmbUI.rt, // response time
      state: tmbUI.status, // state of the response handler
      target: frame!.target, // target word
      type: frame!.type // one of practice or test
    });

    // if we are debugging, log the results
    if (debug === 'true') {
      logResults(results, 'inc');
    }

    if (frame!.type === 'practice') {
      // on practice trials, if the input event returns a timeout
      // or the response is not correct,
      // stop the sequence and advise the participant
      if (tmbUI.status === 'timeout' || !correct) {
        // rewind the frame sequence by one frame,
        // so that the same frame is displayed again
        frameSequence.unshift(frame!);

        showAlert(
          '<br><br>The word pair you learned was:<br>' +
            "<b>'" +
            frame!.probe +
            ' - ' +
            frame!.target +
            "'</b><br>" +
            "<br>You should click '<b>" +
            frame!.target +
            "</b>'.<br><br>",
          'Click here to retry',
          function () {
            showFrame('null');
            nextTrial();
          },
          '20pt'
        );
      } else {
        showFrame('null');
        nextTrial();
      }
    } else if (frame!.type === 'test') {
      // if the input event returns a timeout,
      // stop the sequence and advise the participant
      if (tmbUI.status === 'timeout') {
        // rewind the frame sequence by one frame,
        // so that the same frame is displayed again
        frameSequence.unshift(frame!);
        pairsCount--;

        showAlert(
          '<br><br>You are taking too long to respond.<br><br>' +
            'You should click the word<br>' +
            "that goes with '<b>" +
            frame!.probe +
            "</b>'.</b><br><br>",
          'Click here to retry',
          function () {
            showFrame('null');
            nextTrial();
          },
          '20pt'
        );
      } else {
        showFrame('null');
        nextTrial();
      }
    }
  };

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
            showFrame('null');
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
      // deal with practice and test frames
      else {
        chainTimeouts(
          function () {
            if (frame!.type === 'test') {
              pairsCount++;
              getID('counter').innerHTML = '<b>' + pairsCount + ' of 25</b>';
            } else {
              getID('counter').innerHTML = '<b>Practice</b>';
            }
            showFrame('counter');
          },
          ISI,
          function () {
            getID('probe').innerHTML = frame!.probe.toUpperCase() + ' - ?';
            getID('choice1').innerHTML = '1. ' + frame!.choice1!.toUpperCase();
            getID('choice2').innerHTML = '2. ' + frame!.choice2!.toUpperCase();
            getID('choice3').innerHTML = '3. ' + frame!.choice3!.toUpperCase();
            getID('choice4').innerHTML = '4. ' + frame!.choice4!.toUpperCase();
            showFrame('counter', 'probe', 'choice');
            tmbUI.getInput();
          }
        );
      }
    }
    // else the sequence is empty, we are done!
    else {
      //compute outcomes
      let tmp1: Result[], tmp2: number[], tmp3: string;

      // all test trials (excluding practice and timeouts)
      tmp1 = results.filter(function (obj) {
        return obj.type !== 'practice' && obj.state !== 'timeout';
      });

      // all correct rts
      tmp2 = tmp1
        .filter(function (obj) {
          return obj.correct === 1;
        })
        .pluck('rt');

      // response device
      tmp3 = tmp1[0].state;
      tmp3 = /key/i.test(tmp3)
        ? 'keyboard'
        : /touch/i.test(tmp3)
          ? 'touch'
          : /mouse/i.test(tmp3)
            ? 'mouse'
            : /pen/i.test(tmp3)
              ? 'pen'
              : 'unknown';

      if (tmp1.length) {
        score = outcomes.score = tmp2.length;
        outcomes.accuracy = tmp2.length / tmp1.length;
        outcomes.meanRTc = tmp2.average()!.round(2);
        outcomes.medianRTc = tmp2.median()!.round(2);
        outcomes.sdRTc = tmp2.sd()!.round(2);
        outcomes.responseDevice = tmp3;
        outcomes.testVersion = testVersion;
      }

      // if debugging, output to console
      if (debug === 'true') logResults([outcomes], 'cum');

      // we either save locally or to the server
      if (showresults === 'true' || autosave === 'true' || filename) {
        showAlert(
          '<br><br>Your score is ' +
            score +
            '.<br>' +
            '<br>The test is over.<br>' +
            'Thank you for participating!<br><br>',
          '',
          null,
          '20pt'
        );

        setTimeout(function () {
          if (filename === false) filename = 'VPAresults.csv';
          tmbSubmitToFile(results, filename, autosave);
        }, 2000);
      } else {
        tmbSubmitToServer(results, score, outcomes);
      }
    }
  }

  function setFrameSequence() {
    var testMessage, i;

    // messages
    testMessage = {
      begin: '<h2>Word Pairs Test</h2>' + 'SKY - BLUE<br><br>',
      instructions: [
        '<h3>Instructions:</h3>' +
          'SKY - BLUE<br><br>' +
          "Let's test your memory for the words<br>" +
          'you learned a few minutes ago.<br><br>',
        '<h3>Instructions:</h3>' +
          'For practice, click the word<br>' +
          'that goes together with SKY.<br>' +
          "(hint: it's BLUE!)<br><br>",
        'Excellent!<br><br>' +
          'You will be asked to recall all ' +
          wordPairs.length +
          ' pairs<br>' +
          'of words you saw previously.<br><br>' +
          'This example was easy, but the test<br>' +
          ' word pairs will be more difficult.<br><br>' +
          "Let's start!<br><br>"
      ]
    };

    // type of frame to display
    var frameType = ['begin', 'message', 'message', 'practice', 'message'];

    // message to display
    var frameMessage = [
      testMessage.begin,
      testMessage.instructions[0],
      testMessage.instructions[1],
      '',
      testMessage.instructions[2]
    ];

    // words to display
    var frameProbe = ['', '', '', 'sky', ''];
    var frameTarget = ['', '', '', 'blue', ''];
    var frameChoice1 = ['', '', '', 'pot', ''];
    var frameChoice2 = ['', '', '', 'pan', ''];
    var frameChoice3 = ['', '', '', 'blue', ''];
    var frameChoice4 = ['', '', '', 'dish', ''];

    // push all components into the frames chain
    for (i = 0; i < frameType.length; i++) {
      frameSequence.push({
        choice1: frameChoice1[i],
        choice2: frameChoice2[i],
        choice3: frameChoice3[i],
        choice4: frameChoice4[i],
        message: frameMessage[i],
        probe: frameProbe[i],
        target: frameTarget[i],
        type: frameType[i]
      });
    }

    for (i = 0; i < wordPairs.length; i++) {
      frameSequence.push({
        choice1: wordPairs[i].choice1,
        choice2: wordPairs[i].choice2,
        choice3: wordPairs[i].choice3,
        choice4: wordPairs[i].choice4,
        message: '',
        probe: wordPairs[i].probe,
        target: wordPairs[i].target,
        type: 'test'
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
      var lines,
        words = [],
        errors = 0;

      // Parse the file's text into lines by splitting on 'newline'.
      // (do not use regexp, e.g. /\r?\n/, because ie8 throws up)
      lines = text.split('\n');

      let i = 0;
      // parse each line into words by splitting on 'whitespace'
      for (i = 0; i < lines.length; i++) {
        // first check if this line is a comment (starts with '*'?)
        if (lines[i].startsWith('*')) continue;

        // split on 'whitespace'
        words = lines[i].split(' ');

        // sanitize the words, so there are no linefeeds at the end
        words = words.map(function (s) {
          return s.trim();
        });

        // save probe, target and choice words, or stop and report an error
        if (words.length === 6)
          wordPairs.push({
            choice1: words[2],
            choice2: words[3],
            choice3: words[4],
            choice4: words[5],
            probe: words[0],
            target: words[1]
          });
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

  document.body.innerHTML = html;

  // see if they are just asking for help
  if (getUrlParameters('help', '', true)) {
    showAlert(
      '<b>Usage:</b>' +
        '<br>VerbalPAtest.html?urlparam1=true&urlparam2=false<br><br>' +
        '<b>URL Parameters</b>:<br>' +
        '<i>input=testInput.txt</i> -- word pairs input file' +
        '<i>debug=true</i> -- outputs trial by trial info to the console<br>' +
        '<i>showresults=true</i> -- allows to save results locally in a file<br>' +
        '<i>autosave=true</i> -- will attempt to save results automatically to file<br>' +
        '<i>filename=subject1.csv</i> -- the filename to save results to<br>' +
        '<i>help</i> -- print this message'
    );
    return;
  }

  // check if this is a debug session
  debug = getUrlParameters('debug', '', true) as string;

  // check if they want to load results in a new page when the test is over,
  // if data is to be saved automatically to a file and the filename
  showresults = getUrlParameters('showresults', '', true);
  autosave = getUrlParameters('autosave', '', true);
  filename = getUrlParameters('filename', '', true) as string;

  // determine events to listen to
  if (hasTouch || hasPointer) tmbUI.UIevents = ['taps', 'clicks'];
  else tmbUI.UIevents = ['clicks'];
  tmbUI.UIelements = ['choice1', 'choice2', 'choice3', 'choice4'];
  tmbUI.highlight = 'red';

  setMobileViewportScale(600, 700);

  // disable spurious user interaction
  disableSelect();
  disableRightClick();
  disableDrag();
  disableDoubleTapZoom();

  parseFile(inputFile);
}

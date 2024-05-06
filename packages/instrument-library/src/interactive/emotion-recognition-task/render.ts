/* eslint-disable */
// @ts-nocheck

// This is adapted from the original inline HTML script by Joshua Unrau (JU)
// Comments signed "JU" are written on May 3rd 2024

import img_H2AffectionateJake from './H2Affectionate-Jake.webp';
import img_H17ConfidentAllison from './H17Confident-Allison.webp';
import img_H17ConfidentGail from './H17Confident-Gail.webp';
import img_H20ContentedRob from './H20Contented-Rob.webp';
import img_H33ExcitedObehi from './H33Excited-Obehi.webp';
import img_H35FlirtatiousMara from './H35Flirtatious-Mara.webp';
import img_H35FlirtatiousObehi from './H35Flirtatious-Obehi.webp';
import img_H38GratefulRick from './H38Grateful-Rick.webp';
import img_H38GratefulRob from './H38Grateful-Rob.webp';
import img_angryA17 from './angryA-17.webp';
import img_angryA24 from './angryA-24.webp';
import img_angryA37 from './angryA-37.webp';
import img_angryA39 from './angryA-39.webp';
import img_angryB7 from './angryB-7.webp';
import img_angryB20 from './angryB-20.webp';
import img_angryB41 from './angryB-41.webp';
import img_angryC3 from './angryC-3.webp';
import img_angryC10 from './angryC-10.webp';
import img_angryC14 from './angryC-14.webp';
import img_angryC38 from './angryC-38.webp';
import img_angryD13 from './angryD-13.webp';
import img_blank from './blank.webp';
import img_fearB27 from './fearB-27.webp';
import img_fearfulA30 from './fearfulA-30.webp';
import img_fearfulA25 from './fearfulA2-5.webp';
import img_fearfulA230 from './fearfulA2-30.webp';
import img_fearfulB4 from './fearfulB-4.webp';
import img_fearfulB18 from './fearfulB-18.webp';
import img_fearfulB21 from './fearfulB-21.webp';
import img_fearfulB22 from './fearfulB-22.webp';
import img_fearfulB34 from './fearfulB-34.webp';
import img_fearfulB37 from './fearfulB-37.webp';
import img_fearfulB40 from './fearfulB-40.webp';
import img_fearfulB240 from './fearfulB2-40.webp';
import html from './fragment.html';
import img_happyA36 from './happyA-36.webp';
import img_happyA37 from './happyA-37.webp';
import img_sadA6 from './sadA-6.webp';
import img_sadA19 from './sadA-19.webp';
import img_sadA25 from './sadA-25.webp';
import img_sadA27 from './sadA-27.webp';
import img_sadA32 from './sadA-32.webp';
import img_sadA42 from './sadA-42.webp';
import img_sadA227 from './sadA2-27.webp';
import img_sadA228 from './sadA2-28.webp';
import img_sadB18 from './sadB-18.webp';
import img_sadB20 from './sadB-20.webp';
import img_sadB32 from './sadB-32.webp';
import img_sadB25 from './sadB2-5.webp';

type Result = {
  accuracy: number;
  emotion: string; // 's' | 'd'
  // It seems like NA is coded as 99 (SPSS lol)
  response: number | string;
  rt: number;
  stimulus: any;
};

type Outcomes = {
  emoRecog_accuracy: null | number;
  emoRecog_angry_correct: null | number;
  emoRecog_angry_meanRTc: null | number;
  emoRecog_angry_medianRTc: null | number;
  emoRecog_angry_responses: null | number;
  emoRecog_angry_sdRTc: null | number;
  emoRecog_fearful_correct: null | number;
  emoRecog_fearful_meanRTc: null | number;
  emoRecog_fearful_medianRTc: null | number;
  emoRecog_fearful_responses: null | number;
  emoRecog_fearful_sdRTc: null | number;
  emoRecog_happy_correct: null | number;
  emoRecog_happy_meanRTc: null | number;
  emoRecog_happy_medianRTc: null | number;
  emoRecog_happy_responses: null | number;
  emoRecog_happy_sdRTc: null | number;
  emoRecog_meanRTc: null | number;
  emoRecog_medianRTc: null | number;
  emoRecog_sad_correct: null | number;
  emoRecog_sad_meanRTc: null | number;
  emoRecog_sad_medianRTc: null | number;
  emoRecog_sad_responses: null | number;
  emoRecog_sad_sdRTc: null | number;
  emoRecog_sdRTc: null | number;
};

type DoneFunction = (data: { outcomes: Outcomes; results: Result[]; score: number }) => void;

export async function render(done: DoneFunction) {
  const { attachLoadingSlide, codeToKey, keyToCode, simulateKeyEvent } = await import(
    '/runtime/v1/testmybrain@12.18.0/index.js'
  );

  const { seedrandom } = await import('/runtime/v1/seedrandom@2.4.4/index.js');
  const { mean } = await import('/runtime/v1/lodash-es@4.17.21/index.js');

  /**
   * EXPERIMENTAL PARAMETERS
   *
   * Variables for specifying parameters of each trial, starting from trial 0 (first element)
   * - picFiles contains the names of the image file associated with each trial
   * - trialTypes specifies whether the trial is an instruction trial, a memorization trial, or a test trial
   * - correctResponses specifies the desired response on that trial
   *  - a correct response of 0 means that trial is not accuracy coded
   * 	- a correct response of 1 means the '1' key should be pressed, etc
   *
   * */

  // Image files for task. Since no image is used for instructions, this is coded as the fixation image
  const targetFiles = [
    img_fearfulB18,
    img_angryB20,
    img_angryC3,
    img_fearfulA25,
    img_sadA32,
    img_sadA42,
    img_sadB32,
    img_angryA39,
    img_sadB25,
    img_sadA227,
    img_H38GratefulRick,
    img_happyA37,
    img_sadB20,
    img_angryB7,
    img_happyA36,
    img_H35FlirtatiousMara,
    img_fearfulB240,
    img_H17ConfidentAllison,
    img_sadA19,
    img_fearfulB21,
    img_fearfulA230,
    img_sadB18,
    img_sadA228,
    img_angryC14,
    img_angryA17,
    img_fearfulB40,
    img_H17ConfidentGail,
    img_fearfulB34,
    img_H38GratefulRob,
    img_H20ContentedRob,
    img_angryC10,
    img_H2AffectionateJake,
    img_fearfulB37,
    img_fearfulA30,
    img_fearB27,
    img_fearfulB22,
    img_angryC38,
    img_fearfulB4,
    img_angryA24,
    img_sadA6,
    img_angryB41,
    img_sadA25,
    img_sadA27,
    img_angryA37,
    img_happyA36,
    img_angryD13,
    img_H35FlirtatiousObehi,
    img_H33ExcitedObehi
  ];

  // Define timing parameters

  const picLoadedP: HTMLImageElement[] = [];
  const targDuration = 10000;
  const ITIduration = 250;
  const ISIduration = 250;
  const responseDuration = 10000;

  /**
   * INPUT VARIABLES
   */

  // Along with the spacebar code, define acceptable user inputs that the program will recognize.
  // const response_keys = ['a', 's', 'f', 'h'];
  const spacebarCode = 32;

  // instructions
  // for some reason when you use the <p> tag or <h#> tag it crashes IE.  dunno why.

  // text that appears below images during target judgment

  const warn1 = "Time's up!  Next time try to respond more quickly.";
  const warningText = warn1;
  const warnDuration = 10000;

  /**
   * These arrays will hold data from the experiment
   * primePresTimes --> time from presentation of prime until appearance of face just as a double-check
   * trialRTs --> time from presentation of face until subject response
   * trialRatings --> rating that the subject makes
   * faceRated --> double-check, give name of the target file
   **/

  const presTimes: number[] = [];

  const trialRTs: number[] = [];

  const trialRatings: (number | string)[] = [];

  const faceRated: string[] = [];

  const accuracy: number[] = [];

  // Keep track of which trial we're on (including instructions)
  let trialNumber = 0;

  // Give total number of trials
  const totalTrials = 49; // 156;

  // Variables to hold start time of trial and end time, where presEndTime - presStartTime = pres duration
  // Note: prime corrected to pres in above comment - JU
  let presStartTime: number;
  let presEndTime: number;

  // Variable to hold beginning of rt calculation and end, where rtEndTime - rtStartTime = person's RT
  let rtStartTime: number;
  let rtEndTime: number;

  // Final array that contains all data for this experiment
  // const totalResults = [];

  // Data holders
  let correct = 0;
  let cAngry = 0;
  let cSad = 0;
  let cFear = 0;
  let cHappy = 0;

  // Object containing outcome variables
  const outcomes: Outcomes = {
    emoRecog_accuracy: null,
    emoRecog_angry_correct: null,
    emoRecog_angry_meanRTc: null,
    emoRecog_angry_medianRTc: null,
    emoRecog_angry_responses: null,
    emoRecog_angry_sdRTc: null,
    emoRecog_fearful_correct: null,
    emoRecog_fearful_meanRTc: null,
    emoRecog_fearful_medianRTc: null,
    emoRecog_fearful_responses: null,
    emoRecog_fearful_sdRTc: null,
    emoRecog_happy_correct: null,
    emoRecog_happy_meanRTc: null,
    emoRecog_happy_medianRTc: null,
    emoRecog_happy_responses: null,
    emoRecog_happy_sdRTc: null,
    emoRecog_meanRTc: null,
    emoRecog_medianRTc: null,
    emoRecog_sad_correct: null,
    emoRecog_sad_meanRTc: null,
    emoRecog_sad_medianRTc: null,
    emoRecog_sad_responses: null,
    emoRecog_sad_sdRTc: null,
    emoRecog_sdRTc: null
  };

  // Fixation image load
  const fixationImage = new Image();
  fixationImage.src = img_blank;

  const allResults: Result[] = [];

  /** This was previously defined as a global variable in the trialBegin function - JU */
  let timerID: ReturnType<typeof setTimeout>;

  function getKeyInst(e: KeyboardEvent) {
    let keyevent: KeyboardEvent;
    let v: number;
    keyevent = e || (window.event as KeyboardEvent);
    v = keyevent.charCode || keyevent.keyCode;
    if (v == spacebarCode && trialNumber == 0) {
      const instructions = document.getElementById('instructions')!;
      instructions.innerHTML = '';
      trialBegin();
    }
  }

  /** Calls to preload function -- need an array to put each set in. this is picloaded */
  function preloadPics(picList: string[], picLoadedP: HTMLImageElement[]) {
    const progress = document.getElementById('progress');
    if (!progress) {
      console.error(`Failed to get element with ID 'progress'`);
      return;
    }
    progress.innerHTML = "<font color='red'>LOADING FILES...</font>";
    for (let i = 0; i <= totalTrials; i++) {
      picLoadedP[i] = new Image();
      picLoadedP[i].src = picList[i];
    }
    progress.innerHTML = '';
    document.onkeyup = getKeyInst;
  }

  /** Present instructions or the prime stimulus */
  function trialBegin() {
    document.getElementById('instructions')!.innerHTML = '';
    document.getElementById('counter')!.style.display = 'block';
    document.getElementById('response_buttons')!.style.display = 'block';
    document.getElementById('next_button')!.style.display = 'none';
    document.getElementById('tn')!.innerHTML = String(trialNumber + 1);
    // @ts-expect-error - no idea why this works, but it
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    document.stimulus.src = picLoadedP[trialNumber].src;
    document.getElementById('stimulus')!.style.width = '300px';
    rtStartTime = Date.now();
    document.onkeyup = getKeyTarg;
    //document.stimulus.src = picLoadedP[trialNumber].src;
    //console.log(picLoadedP[trialNumber].src);
    presStartTime = Date.now();
    timerID = setTimeout(ISI, targDuration);
  }

  /** Calculate how long the target was onscreen */
  function ISI() {
    presEndTime = Date.now();
    presTimes[trialNumber] = presEndTime - presStartTime;
    timerID = setTimeout(expJudge, ISIduration);
  }

  function expJudge() {
    document.getElementById('response_buttons')!.style.display = 'block';
    document.getElementById('next_button')!.style.display = 'none';
    // document.stimulus.src = fixationImage.src;
    faceRated[trialNumber] = targetFiles[trialNumber];
    timerID = setTimeout(warningStim, responseDuration);
  }

  function warningStim() {
    // @ts-expect-error - no idea why this works, but it
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    document.stimulus.src = fixationImage.src;
    document.getElementById('response_buttons')!.style.display = 'none';
    document.getElementById('next_button')!.style.display = 'block';
    document.getElementById('instructions')!.innerHTML = warningText;
    document.onkeyup = getKeyWarn;
    timerID = setTimeout(fixationStim, warnDuration);
  }

  function fixationStim() {
    clearTimeout(timerID);
    document.getElementById('response_buttons')!.style.display = 'block';
    document.getElementById('next_button')!.style.display = 'none';
    document.onkeyup = getKeyNone;
    //console.log(trialNumber+" - trialRTs:"+trialRTs[trialNumber]);
    // @ts-expect-error - no idea why this works, but it
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    document.stimulus.src = fixationImage.src;
    timerID = setTimeout(trialEnd, ITIduration);
  }

  function getKeyTarg(e: KeyboardEvent) {
    let keyevent: KeyboardEvent;
    let v: number;
    let keyvalue: string;

    keyevent = e || window.event;

    v = keyevent.charCode || keyevent.keyCode;
    keyvalue = codeToKey(v);

    //console.log(trialNumber+" - Keypress:"+which);
    if (keyvalue == 'h' || keyvalue == 'f' || keyvalue == 's' || keyvalue == 'a') {
      rtEndTime = Date.now();
      clearTimeout(timerID);
      trialRatings[trialNumber] = keyvalue;
      //console.log("Key value:"+keyvalue);
      const correctResponse = targetFiles[trialNumber].charAt(0).toLowerCase();
      //console.log("Correct is:"+correctResponse);
      if (keyvalue == correctResponse) {
        correct = correct + 1;
        accuracy[trialNumber] = 1;
        //console.log("Number correct:"+correct);
        switch (correctResponse) {
          // @ts-expect-error - wow, this is in production?
          case 'A':
            cAngry = cAngry + 1;
            break;
          // @ts-expect-error - wow, this is in production?
          case 'S':
            cSad = cSad + 1;
            break;
          // @ts-expect-error - wow, this is in production?
          case 'F':
            cFear = cFear + 1;
            break;
          // @ts-expect-error - wow, this is in production?
          case 'H':
            cHappy = cHappy + 1;
            break;
          // @ts-expect-error - wow, this is in production?
          case 'N':
            break;
        }
      } else {
        accuracy[trialNumber] = 0;
      }
      //console.log(trialNumber+" - Rating:"+trialRatings[trialNumber]);
      trialRTs[trialNumber] = rtEndTime - rtStartTime;
      // console.log("accuracy:"+accuracy[trialNumber]);
      fixationStim();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function getKeyNone() {
    console.error(`WARNING: Invoked getKeyTarg, a useless function`);
  }

  function getKeyWarn(e: KeyboardEvent) {
    var keyevent: KeyboardEvent;
    let v: number;
    //JU let keyvalue: string;
    keyevent = e || window.event;
    v = keyevent.charCode || keyevent.keyCode;
    //JU keyvalue = codeToKey(v);
    //consoleUog(trialNumber+" - Keypress:"+which);
    if (v == spacebarCode) {
      fixationStim();
    }
  }

  function trialEnd() {
    document.onkeyup = getKeyNone;
    if (!trialRatings[trialNumber]) {
      trialRatings[trialNumber] = 99;
      accuracy[trialNumber] = 0;
      trialRTs[trialNumber] = 20000;
    }

    allResults.push({
      accuracy: accuracy[trialNumber],
      emotion: targetFiles[trialNumber].charAt(0).toLowerCase(),
      response: trialRatings[trialNumber],
      rt: trialRTs[trialNumber],
      stimulus: targetFiles[trialNumber]
    });
    //console.log(accuracy[trialNumber]);
    //console.log(correctResponses[trialNumber]);
    if (trialNumber >= totalTrials - 2) {
      saveData();
    } else {
      //alert(trialRatings[trialNumber]);
      trialNumber++;
      trialBegin();
    }
  }

  // Presumes equal length of arrays, or that array1 length is most imp
  function saveData() {
    var tmp1, tmp2;

    outcomes.emoRecog_accuracy = allResults.pluck('accuracy').average();
    tmp1 = allResults.filter(function (obj) {
      return obj.accuracy === 1;
    });
    tmp2 = tmp1.pluck('rt');
    outcomes.emoRecog_meanRTc = tmp2.average();
    outcomes.emoRecog_medianRTc = tmp2.median();
    outcomes.emoRecog_sdRTc = tmp2.sd();

    tmp1 = allResults.filter(function (obj) {
      return obj.accuracy === 1 && obj.emotion === 'h';
    });
    outcomes.emoRecog_happy_correct = tmp1.pluck('accuracy').average();

    tmp2 = allResults.filter(function (obj) {
      return obj.response === 'h';
    });
    outcomes.emoRecog_happy_responses = tmp2.length;

    tmp2 = tmp1.pluck('rt');
    outcomes.emoRecog_happy_meanRTc = tmp2.average();
    outcomes.emoRecog_happy_medianRTc = tmp2.median();
    outcomes.emoRecog_happy_sdRTc = tmp2.sd();

    tmp1 = allResults.filter(function (obj) {
      return obj.accuracy === 1 && obj.emotion === 'a';
    });
    outcomes.emoRecog_angry_correct = tmp1.pluck('accuracy').average();

    tmp2 = allResults.filter(function (obj) {
      return obj.response === 'a';
    });
    outcomes.emoRecog_angry_responses = tmp2.length;

    tmp2 = tmp1.pluck('rt');
    outcomes.emoRecog_angry_meanRTc = tmp2.average();
    outcomes.emoRecog_angry_medianRTc = tmp2.median();
    outcomes.emoRecog_angry_sdRTc = tmp2.sd();

    tmp1 = allResults.filter(function (obj) {
      return obj.accuracy === 1 && obj.emotion === 'f';
    });
    outcomes.emoRecog_fearful_correct = tmp1.pluck('accuracy').average();

    tmp2 = allResults.filter(function (obj) {
      return obj.response === 'f';
    });
    outcomes.emoRecog_fearful_responses = tmp2.length;

    tmp2 = tmp1.pluck('rt');
    outcomes.emoRecog_fearful_meanRTc = tmp2.average();
    outcomes.emoRecog_fearful_medianRTc = tmp2.median();
    outcomes.emoRecog_fearful_sdRTc = tmp2.sd();

    tmp1 = allResults.filter(function (obj) {
      return obj.accuracy === 1 && obj.emotion === 's';
    });
    outcomes.emoRecog_sad_correct = tmp1.pluck('accuracy').average();

    tmp2 = allResults.filter(function (obj) {
      return obj.response === 's';
    });
    outcomes.emoRecog_sad_responses = tmp2.length;

    tmp2 = tmp1.pluck('rt');
    outcomes.emoRecog_sad_meanRTc = tmp2.average();
    outcomes.emoRecog_sad_medianRTc = tmp2.median();
    outcomes.emoRecog_sad_sdRTc = tmp2.sd();

    const data = {
      outcomes,
      results: allResults,
      score: correct
    };

    done(data);
  }

  /**
   * In the original version, there were four HTML files that differed as follows -JU
   * // EmoRecog_Aurora1.html -- Math.seedrandom('EmoRecog1');
   * // EmoRecog_Aurora2.html -- Math.seedrandom('EmoRecog2');
   * // EmoRecog_Aurora3.html -- Math.seedrandom('EmoRecog3');
   * // EmoRecog_Aurora4.html -- Math.seedrandom('EmoRecog4');
   *
   * There was a fifth file EmoRecog_Aurora4.old.html that I removed
   */

  // This was previously a side effect in the bundle - JU
  attachLoadingSlide();
  seedrandom('EmoRecog1', { global: true });

  document.body.innerHTML = html;

  document.getElementById('angry')!.addEventListener('click', () => {
    simulateKeyEvent('keydown', keyToCode('a'));
    simulateKeyEvent('keyup', keyToCode('a'));
  });

  document.getElementById('fearful')!.addEventListener('click', () => {
    simulateKeyEvent('keydown', keyToCode('f'));
    simulateKeyEvent('keyup', keyToCode('f'));
  });

  document.getElementById('sad')!.addEventListener('click', () => {
    simulateKeyEvent('keydown', keyToCode('s'));
    simulateKeyEvent('keyup', keyToCode('s'));
  });

  document.getElementById('happy')!.addEventListener('click', () => {
    simulateKeyEvent('keydown', keyToCode('h'));
    simulateKeyEvent('keyup', keyToCode('h'));
  });

  document.getElementById('next')!.addEventListener('click', () => {
    simulateKeyEvent('keydown', keyToCode('space'));
    simulateKeyEvent('keyup', keyToCode('space'));
  });

  preloadPics(targetFiles, picLoadedP);
}

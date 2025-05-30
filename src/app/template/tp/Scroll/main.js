var data1 = [
  '2   दिल्ली में',
  '1   मुख्यमंत्री योगी आदित्यनाथ ने दी मुलायम सिंह को जन्मदिन की बधाई, जानिए क्या कहा',
  '3   चलने नहीं देंगे रामायण एक्सप्रेस, संतों की वेशभूषा में वेटरों पर साधुओं की चेतावनी',
  '4   मंत्रिमंडल विस्तार ',
  '5   Shaurya Chakra: शादी के 10 महीने में हुए शहीद, I LOVE YOU कहकर पत्नी ने दी थी अंतिम विदाई',
  '6   पाक को खदेड़ने ',
];

// Store timelines so they can be killed when needed
let activeTimelines = [];

// Function to clear all running scroll items and reset the ticker
function clearAndRestartTicker() {
  // Stop the current ticker
  _onAir = false;

  // Kill all GSAP timelines
  activeTimelines.forEach(tl => tl.kill());
  activeTimelines = []; // Clear timeline array

  // Remove all current ticker items
  const svgElement = document.getElementsByTagName('svg')[0];
  svgElement.querySelectorAll('g[id^="tc"]').forEach(item => item.remove());

  // Reset counter and messages array
  _counter = 1;
  _stopatcounter = 0;

  // Reset messages to the initial state
  // messages = [...data1];

  // Start the ticker again from the first message
  // start();
}

let messages = data1;
var _speed = 700;
var _gap = 100;
var _ltr = true;
var putImage = true;

const nickbMethod = () => {
  _onAir = false;
  _counter = 1;
  _stopatcounter = 0;

  const _screen = 2100;

  function start() {
    _onAir = true;
    next();
  }
  window.start = start;

  function stop() {
    _onAir = false;
    _stopatcounter = _counter;
  }
  window.stop = stop;

  // Attach clear and restart method
  window.clearAndRestartTicker = clearAndRestartTicker;

  document
    .getElementById('ccg_scroll')
    .getElementsByTagName('text')[0]
    .getElementsByTagName('tspan')[0].textContent = '';

  function next() {
    if (!_onAir) return;

    _counter++;

    var originalGroup = document.getElementById('ccg_scroll');
    var originalGroup2 = document.getElementById('ccg_image');
    const ctm = originalGroup2.getCTM();

    gsap.set(originalGroup2, { x: 3000 });

    originalGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = '';

    const nextDiv = originalGroup.cloneNode(true);
    const nextDiv2 = originalGroup2.cloneNode(true);
    nextDiv2.removeAttribute('id');

    if (putImage) {
      nextDiv.appendChild(nextDiv2);
    }

    let nextMsg = messages.shift();
    messages.push(nextMsg);
    nextDiv.setAttribute('id', 'tc' + _counter);
    nextDiv
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = nextMsg;

    gsap.set(nextDiv2, { x: -100, y: 0, scaleX: ctm.a, scaleY: ctm.d });

    document.getElementsByTagName('svg')[0].appendChild(nextDiv);

    let msgWidth = nextDiv.getBBox().width;
    gsap.set(nextDiv, { x: _ltr ? -msgWidth : _screen });

    let timeline = gsap.timeline({ paused: true });
    timeline.to(nextDiv, {
      duration: getDuration(msgWidth),
      x: _ltr ? _screen : -msgWidth,
      ease: 'none',
    });

    timeline.play();
    activeTimelines.push(timeline); // Store the timeline in the array

    timeline.eventCallback('onComplete', offScreen, [nextDiv.id]);
    timeline.call(next, [], getNextMsgTime(msgWidth));
  }

  function getDuration(width) {
    return (_screen + width) / _speed;
  }

  function getNextMsgTime(width) {
    return (width + _gap) / _speed;
  }

  function offScreen(id) {
    let ticker = document.getElementsByTagName('svg')[0];
    let tickerMsg = document.getElementById(id);
    ticker.removeChild(tickerMsg);

    if (_onAir === false && id === 'tc' + _stopatcounter) {
      document
        .getElementsByTagName('svg')[0]
        .removeChild(document.getElementById('scroll_strip'));
    }
  }
};

const scriptgsap = document.createElement('script');
scriptgsap.src = './js/gsap.min.js';
scriptgsap.setAttribute('type', 'text/javascript');
scriptgsap.onload = function () {
  nickbMethod();
};
document.body.appendChild(scriptgsap);

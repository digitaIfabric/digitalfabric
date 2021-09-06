//                                                 _          _       __  _        _ _ _ __  _  ____
//                                            ___ (_)__ _  __| |_ __ |_ \| |_ __ _| (_) '_ \(_)/ _  |
//                                           |__ \| |__` |/ _` | '_ \ _| | | '_ \__ | | |_) | | | | |
//                                            __) | |  | | (_| | |_) |_  | | |_) || | | .__/| | |_| |
// 1. Rethink, Create, Invent                |___/|_|  |_|\__,_|_.__/  |_|_|_.__/__/|_|\___||_|\____|
const core = require('elementary-core');
const el = require('@nick-thompson/elementary');

const b4 = 493.88 * 0.5;
const e4 = 329.63 * 0.5;
const a4 = 440 * 0.5;
const g4 = 391.99 * 0.5;

const rim = '~/Music/Samples/FeelRim.wav';
const bass  = '~/Music/Samples/FeelBass.wav';
const hihat = '~/Music/Samples/FeelHiHat.wav';

const s1 = [e4, g4, b4, a4];
const s2 = [e4, g4, b4, a4].map(x => x * 0.999);

function voice(fq) {
  return el.cycle(
    el.add(
      fq,
      el.mul(
        el.mul(el.add(16, el.cycle(0.1)), el.mul(fq, 3.17)),
        el.cycle(fq),
      ),
    ),
  );
}

function modulate(x, rate, amount) {
  return el.add(x, el.mul(amount, el.cycle(rate)));
}

core.on('load', function() {
  // Tempo 120 BPM G
  let gate = el.train(4);

  let env = el.adsr(0.004, 0.01, 0.2, 0.5, gate);

  let left = el.mul(env, voice(el.seq({seq: s1, hold: true}, gate)));
  let right = el.mul(env, voice(el.seq({seq: s2, hold: true}, gate)));

  let filteredLeft = el.lowpass(modulate(1000, 1, 400), 1.4, left);
  let filteredRight= el.lowpass(modulate(1000, 1, 400), 1.4, right);
  let delayedLeft = el.delay({size: 44100}, el.ms2samps(375), 0.5, filteredLeft);
  let delayedRight = el.delay({size: 44100}, el.ms2samps(375), 0.5, filteredRight);
  let outL = el.add(filteredLeft, delayedLeft);
  let outR = el.add(filteredRight, delayedRight);

  let out2 = el.add(
    el.sample({path: rim, channel: 0},   el.seq({seq: [1, 0, 0, 0, 1, 0, 0, 0]}, gate)),
    el.sample({path: rim, channel: 1},   el.seq({seq: [1, 0, 0, 0, 1, 0, 0, 0]}, gate)),
    el.sample({path: bass, channel: 0},  el.seq({seq: [1, 0, 1, 0, 1, 0, 1, 0]}, gate)),
    el.sample({path: bass, channel: 1},  el.seq({seq: [1, 0, 1, 0, 1, 0, 1, 0]}, gate)),
    el.sample({path: hihat, channel: 0}, el.seq({seq: [0, 1, 0, 1, 0, 1, 0, 1]}, gate)),
    el.sample({path: hihat, channel: 1}, el.seq({seq: [0, 1, 0, 1, 0, 1, 0, 1]}, gate))
  );

  core.render(
    el.add(
      el.mul(0.3, outL),
      el.mul(0.3, out2)
    ),
    el.add(
      el.mul(0.3, outR),
      el.mul(0.3, out2)
    )
  );
});

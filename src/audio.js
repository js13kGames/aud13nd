import $ from "./Gloop/util/$dom";
import parseSong from "./Gloop/util/audio/parse/song";

function pluginAudio() {
  const game = this;

  // initialize web audio
  const ctx = new AudioContext();

  // enable on user gestures
  $(document.body).on("click", () => {
    if (ctx.state === "suspended") {
      console.log("ENABLED WEB AUDIO");
      ctx.resume();
    }
  });
  // a bunch of analyzers for each instrument
  const graphLead = new AnalyserNode(ctx);
  const graphBass = new AnalyserNode(ctx);
  const graphKick = new AnalyserNode(ctx);
  const graphSnare = new AnalyserNode(ctx);
  const graphHat = new AnalyserNode(ctx);
  // a bunch of gains to control each instrument
  const gainLead = new GainNode(ctx);
  const gainBass = new GainNode(ctx);
  const gainKick = new GainNode(ctx);
  const gainSnare = new GainNode(ctx);
  const gainHat = new GainNode(ctx);
  // compress loudest parts to prevent clipping
  const limiter = new DynamicsCompressorNode(ctx, {
    ratio: 20,
    knee: 1,
    attack: 0,
    release: 0.015
  });
  // final gain to control volume
  const gainVolume = new GainNode(ctx);
  // wired it all together
  gainLead.connect(graphLead).connect(limiter);
  gainBass.connect(graphBass).connect(limiter);
  gainKick.connect(graphKick).connect(limiter);
  gainSnare.connect(graphSnare).connect(limiter);
  gainHat.connect(graphHat).connect(limiter);
  limiter.connect(gainVolume).connect(ctx.destination);

  const renderAnalyzers = (opts) => {
    renderAnalyzer(graphHat, { ...opts, hue: 290 });
    renderAnalyzer(graphSnare, { ...opts, hue: 210 });
    renderAnalyzer(graphKick, { ...opts, hue: 185 });
    renderAnalyzer(graphBass, { ...opts, hue: 330 });
    renderAnalyzer(graphLead, { ...opts, hue: 120 });
  }

  // draw analyzer graph of the audio stream
  const renderAnalyzer = (node, { x, y, w, h, s, hue, alpha }) => {
    const { ctx } = game.canvas;
    // draw the frequency line
    ctx.lineWidth = s;
    ctx.lineJoin = "round";
    ctx.strokeStyle = `hsla(${hue},100%,50%,${alpha})`;
    ctx.beginPath();
    // read analyser data
    const bufferLength = node.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    node.getByteTimeDomainData(dataArray);
    const sliceWidth = (w * 1.0) / bufferLength;
    for (let dx = 0, i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const dy = (v * h) / 2;
      ctx[i===0 ? "moveTo" : "lineTo"](x + dx, y + dy);
      dx += sliceWidth;
    }
    ctx.lineTo(w + x, y + h / 2);
    ctx.stroke();
  };

  // synth lead ~ A4/4
  const playLead = (start, frequency=440, duration=0.5, params={}) => {
    const { wave, attack, decay, sustain, release } = params;
    // create a tone
    const osc = new OscillatorNode(ctx, {
      type: wave,
      frequency
    });
    // shape the tone
    const env = new GainNode(ctx);
    // shape envelope
    env.gain.setValueAtTime(0, start);
    env.gain.exponentialRampToValueAtTime(1, start + (attack * duration));
    env.gain.exponentialRampToValueAtTime(sustain, start + (attack * duration) + (decay * duration));
    env.gain.exponentialRampToValueAtTime(0.00001, start + duration + (release * duration));
    // begin/end tone
    osc.start(start);
    osc.stop(start + duration + (release * duration));
    // cleanup
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
    osc.connect(env).connect(gainLead); // .connect(filter)
  }

  // drum kick ~ E3/4
  const playKick = (start, frequency=167.1, duration=0.5, params={}) => {
    // create a tone
    const osc = new OscillatorNode(ctx, {
      type: "sine",
      frequency
    });
    // shape the envelope
    const env = new GainNode(ctx);
    osc.frequency.setValueAtTime(frequency, start + 0.001);
    env.gain.linearRampToValueAtTime(1, start + 0.1)
    osc.frequency.exponentialRampToValueAtTime(1, start + duration);
    env.gain.exponentialRampToValueAtTime(0.01, start + duration);
    env.gain.linearRampToValueAtTime(0, start + duration + 0.1)
    // begin/end
    osc.start(start);
    osc.stop(start + duration + 0.1);
    // cleanup
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
    // wired up
    osc.connect(env).connect(gainKick);
  };

  // drum snare ~ G2/8
  const playSnare = (start, frequency=100, duration=0.25, params={}) => {
    // noise and filter
    const noise = makeNoiseBuffer();
    const filter = new BiquadFilterNode(ctx, {
      type: 'highpass',
      frequency: 1000
    });
    // shape noise envelope
    const envNoise = new GainNode(ctx);
    envNoise.gain.setValueAtTime(1, start);
    envNoise.gain.exponentialRampToValueAtTime(0.01, start + duration);
    // shape tone envelope
    const envTone = new GainNode(ctx);
    const tone = new OscillatorNode(ctx, { type: "triangle", frequency });
    envTone.gain.setValueAtTime(0.7, start);
    envTone.gain.exponentialRampToValueAtTime(0.01, start + duration / 2);
    // begin/end
    noise.start(start)
    noise.stop(start + duration);
    tone.start(start)
    tone.stop(start + duration);
    // cleanup
    tone.onended = () => {
      tone.disconnect();
      noise.disconnect();
    };
    // wired up
    noise.connect(filter).connect(envNoise).connect(gainSnare);
    tone.connect(envTone).connect(gainSnare);
  };

  // make some audio noise
  const makeNoiseBuffer = () => {
    const size = ctx.sampleRate;
    const buffer = new AudioBuffer({
      numberOfChannels: 1,
      length: size,
      sampleRate: size,
    });
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = game.random(2, 1);
    }
    return new AudioBufferSourceNode(ctx, { buffer });
  };

  // drum clap ~ C3/5•
  // const playClap = (start, frequency=130, duration=0.3) => {
  //   const pulseWidth = 0.025;
  //   // noise and filter
  //   const noise = makeNoiseBuffer();
  //   const filter = new BiquadFilterNode(ctx, {
  //     type: 'highpass',
  //     frequency: frequency * 2
  //   });
  //   // shape noise envelope
  //   const env = new GainNode(ctx);
  //   env.gain.setValueAtTime(1, start);
  //   env.gain.exponentialRampToValueAtTime(0.1, start + pulseWidth);
  //   env.gain.setValueAtTime(1, start + pulseWidth);
  //   env.gain.exponentialRampToValueAtTime(0.1, start + 2 * pulseWidth);
  //   env.gain.setValueAtTime(1, start + 2 * pulseWidth);
  //   env.gain.exponentialRampToValueAtTime(0.001, start + duration);
  //   // begin/end
  //   noise.start(start)
  //   noise.stop(start + duration);
  //   // cleanup
  //   noise.onended = () => {
  //     env.disconnect();
  //     filter.disconnect();
  //     noise.disconnect();
  //   };
  //   // wired up
  //   noise.connect(filter).connect(env).connect(graphClap);
  // };

  // drum hat ~ C3/2•
  const playHat = (start, frequency=130.81, duration=1.5, params={}) => {
    // shape the envelope
    const env = new GainNode(ctx);
    env.gain.setValueAtTime(0.00001, start);
    env.gain.exponentialRampToValueAtTime(1, start + 0.067 * duration);
    env.gain.exponentialRampToValueAtTime(0.3, start + 0.1 * duration);
    env.gain.exponentialRampToValueAtTime(0.00001, start + duration);
    // filters
    const bandpass = new BiquadFilterNode(ctx, {
      type: 'bandpass',
      frequency: 20000,
      Q: 0.2
    });
    const highpass = new BiquadFilterNode(ctx, {
      type: 'highpass',
      frequency: 5000
    });
    // wired up
    bandpass.connect(highpass).connect(env).connect(gainHat);
    // layered square waves
    ([1, 1.3420, 1.2312, 1.6532, 1.9523, 2.1523]).forEach(ratio => {
      const osc = new OscillatorNode(ctx, {
        type: "square",
        frequency: frequency * ratio
      });
      // begin/end
      osc.start(start);
      osc.stop(start + duration);
      // cleanup
      osc.onended = () => {
        osc.disconnect();
      };
      // wired
      osc.connect(bandpass);
    });
  };

  const setGain = (node, value) => {
    value = value === 0 ? 0.000001 : value;
    node.gain.exponentialRampToValueAtTime(value, ctx.currentTime);
  };

  game.on("state_change", ({ key, value, previous })=>{
    let node = null, num = null;
    switch (key){
      case "lead":
        node = gainLead;
        num = value?.params?.gain;
        break;
      case "bass":
        node = gainBass;
        num = value?.params?.gain;
        break;
      case "kick":
        node = gainKick;
        num = value?.params?.gain;
        break;
      case "snare":
        node = gainSnare;
        num = value?.params?.gain;
        break;
      case "hat":
        node = gainHat;
        num = value?.params?.gain;
        break;
      case "volume":
        node = gainVolume;
        num = value;
        break;
    }
    if (node != null && num != null){
      setGain(node, num);
    }
  });

  const playSong = (song="", play=playLead, tempo=120) => {
    let time = ctx.currentTime;
    parseSong(song).forEach(({ count, tones }) => {
      const duration = count * (60 / tempo);
      tones.forEach(hz => play(time, hz, duration));
      time += duration;
    })
  };

  game.on("foe_collision", () => {
    playSong("A4E7/2", playKick);
  });
  game.on("foe_expire", () => {
    playSong("A7G3/4", playHat);
  });

  return {
    name: "audio",
    ctx,
    playLead,
    playKick,
    playSnare,
    // playClap,
    playHat,
    renderAnalyzers
  }
}

export default pluginAudio;

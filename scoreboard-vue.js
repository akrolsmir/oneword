const MESSAGES = {
  0: "You do understand this is supposed to be a COOPERATIVE game, right?",
  1: "At least you can't do much worse next time!",
  2: "Uh... Were you even trying?",
  3: "Here's a tip: try not colliding so much.",
  4: "Well, it's not the worst result I've ever seen...",
  5: "Alright, now that you've warmed up, are you ready to play for real?",
  6: "Respectable attempt. Want to try again?",
  7: "Okay... At least it's a lucky number?",
  8: "Not bad! Now we're getting somewhere.",
  10: "Huh, color me impressed. Was it a fluke?",
  11: "You really dialed it to the next level. Try a harder category next time!",
  12: "You all must be cheating somehow, I just know it...",
  13: "Wow, that's hall of fame material right there. I am in awe.",
}

Vue.component('scoreboard', {
  data() {
    return {
      MESSAGES,
      showNextRound: false,
    };
  },
  props: {
    history: Array,
    currentRound: Object,
    roundsInGame: Object,
  },
  mounted() {
    startFireworks(this.correct);
  },
  computed: {
    rounds() {
      return [...this.history.slice(), this.currentRound];
    },
    window() {
      return this.roundsInGame == 'Unlimited' ? 1024 /* Basically unlimited */ : this.roundsInGame;
    },
    correct() {
      return this.rounds
        .splice(-this.window) // Only count the last window rounds
        .map(r => r.guess == r.word ? 1 : 0)
        .reduce((a, b) => a + b, 0);
    }
  },
  template: `
  <div>
    <div v-if="rounds.length % window == 0">
      <h1>And that's a wrap!</h1><br>

      <canvas id="fireworks"></canvas>

      <h2>Final score: {{ correct }} correct / {{ window }} rounds </h2>
      ({{ MESSAGES[correct] }})<br>
      <br>

      If you enjoyed One Word, consider becoming a supporter!<br>
      You can earn nice perks like private rooms, while helping cover our server costs.<br>
      <br>

      <a target="_blank" rel="noopener noreferrer" href="./supporter.html" class="button is-link">Become a supporter!</a><br>
      <br>
      
      <a @click="showNextRound = !showNextRound">(Not done playing? Alright, click here to continue.)</a>
    </div>
    <div v-if="rounds.length % window != 0 || showNextRound">
      <slot></slot>
    </div>
  </div>
`
})

// Fireworks effect shamelessly stolen from:
// https://www.html5canvastutorials.com/advanced/html5-canvas-fireworks-effect/
function startFireworks(correct) {
  // VARIABLEZ
  // play with them
  var c = document.querySelector('#fireworks'),
    ctx = c.getContext('2d'),
    width = c.width = 600,
    height = c.height = 200,

    n_stars = 20 + correct * 10, //num of stars
    stars = [], //array to store generated stars
    twinkleFactor = .4, //how much stars 'twinkle'
    maxStarRadius = 3,

    fw1, fw2, //firework objects
    minStrength = 1.5, //lowest firework power
    maxStrength = 7, //highest firework power
    minTrails = 7, //min particles
    maxTrails = 30, //max particles
    particleRadius = 2,
    trailLength = 15, //particle trail length
    delay = .5, // number of LIFEs between explosions

    LIFE = 150, //life time of firework

    g = 5e-2, //strength of gravity
    D = 1e-3; //strength of drag (air resistance)

  // Particle Class
  var Particle = function (x, y, vx, vy, ax, ay, colour) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;
    this.life = LIFE; //only here for opacity in .draw() method
    this.path = [];
    this.colour = colour;
    this.r = particleRadius;

    this.update = function () {
      this.life--;

      // add point to path but if full, remove a point first
      if (this.path.length >= trailLength) this.path.shift();
      this.path.push([this.x, this.y])

      // update speed n position n stuff
      this.vy += this.ay;
      this.vx += this.ax;
      this.x += this.vx;
      this.y += this.vy;
    }

    this.draw = function () {
      var opacity = ~~(this.life * 100 / LIFE) / 100;

      // tail      
      ctx.fillStyle = 'rgba(' + this.colour + (opacity * 0.4) + ')';
      if (this.life > LIFE * 0.95) ctx.fillStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x - this.r, this.y);
      var i = this.path.length - 1;
      ctx.lineTo(this.path[0][0], this.path[0][1]);
      ctx.lineTo(this.x + this.r, this.y);
      ctx.closePath();
      ctx.fill();

      // main dot
      ctx.fillStyle = 'rgba(' + this.colour + opacity + ')';
      if (this.life > LIFE * 0.95) ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(~~this.x, ~~this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  // Firework class
  var Firework = function () {
    this.x = width * (Math.random() * 0.8 + 0.1); // from 0.1-0.9 widths
    this.y = height * (Math.random() * 0.8 + 0.1); // from 0.1-0.9 heights
    this.strength = Math.random() * (maxStrength - minStrength) + minStrength;
    this.colour = ~~(Math.random() * 255) + ',' +
      ~~(Math.random() * 255) + ',' +
      ~~(Math.random() * 255) + ',';
    this.life = 0;
    this.particles = (function (x, y, strength, colour) {
      var p = [];

      var n = ~~(Math.random() * (maxTrails - minTrails)) + minTrails;
      var ay = g;
      for (var i = n; i--;) {
        var ax = D;
        var angle = i * Math.PI * 2 / n;
        if (angle < Math.PI) ax *= -1;
        var vx = strength * Math.sin(angle);
        var vy = strength * Math.cos(angle);
        p.push(new Particle(x, y, vx, vy, ax, ay, colour));
      }

      return p;
    })(this.x, this.y, this.strength, this.colour);

    this.update = function () {
      this.life++;
      if (this.life < 0) return; //allows life to be delayed
      for (var i = this.particles.length; i--;) {
        this.particles[i].update();
        this.particles[i].draw();
        //wasn't bothered to make an extra draw function for firework class
      }
    }
  };

  var Star = function () {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.r = Math.random() * maxStarRadius;
    this.b = ~~(Math.random() * 100) / 100;
  }

  Star.prototype.draw = function () {
    this.b += twinkleFactor * (Math.random() - .5);
    ctx.fillStyle = 'rgba(255,255,255,' + this.b + ')';
    ctx.beginPath();
    ctx.arc(~~this.x, ~~this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  function createStars() {
    for (var i = n_stars; i--;) stars.push(new Star);
  }

  function main() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (var i = n_stars; i--;) stars[i].draw();

    fw1.update();
    fw2.update();

    if (fw1.life == LIFE * delay) fw2 = new Firework;
    if (fw2.life == LIFE * delay) fw1 = new Firework;

    window.requestAnimationFrame(main);
  }

  function init() {
    fw1 = new Firework;
    fw2 = new Firework;
    fw2.life = -LIFE * delay;
    createStars();
    main();
  }

  init();
}

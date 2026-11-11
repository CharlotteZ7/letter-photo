/* =========================================================
 * 写给蒋伯驾的一封信 · 交互
 *
 * 想改内容，只需要改下面「可修改区」：
 *   NAME    —— 气泡上方的名牌（收信人）
 *   WISHES  —— 方框模式的文案，一行一条
 *   CONFIG  —— 出现速度 / 停留时长 / 顺序
 * ========================================================= */
'use strict';

(function () {
  /* ===================== 可修改区 ===================== */

  const NAME = '蒋伯驾';

  const WISHES = [
    '蒋伯驾，我们在相同的频道里',
    '蒋生官仔骨骨，最适合危情共舞',
    '蒋伯驾，我们去老派约会吧',
    '我陪你吃，到时候你魂被人扯走了，我就拉着你，一直拉着你',
    '我的魂沉，他们带不走你，除非你自己想走',
    '蒋伯驾，我觉得你需要一个女朋友，扯着你的魂魄。你觉得，我行吗',
    '蒋伯驾，天地之宽，出路万万千',
    '蒋伯驾，爱过了头难看',
    '不管今夕何夕，不管谁输谁赢，我们相拥一刻是一刻',
    '我不是最终选择他，其实，我是从一开始，就选了蒋伯驾',
    '我这种有点情感漠视的人，面对你时，竟然充满了不确定',
    '把你亲手送入警局，是你送我的生日礼物吗',
    '我们的命运是一个完整的圆，你在明，我在暗，我们合起来，才是宿命完整的模样',
    '我的爱人犯的是刑法中的刑法，爱也无法赦免他',
    '有一天，当帝国与侵略主义彻底消亡，爱便拥有这世界上唯一一块殖民地',
    '三千年的冲突里，你是我永恒的平静',
    '生辰快乐。',
    '我不奢望他今生有好果得偿，但请让我在宇宙的轮转中，相逢于对错之外的教堂',
    '我的爱情，明明始于一见钟情',
    '蒋伯驾，你真是个疯子',
    '老派约会啊，那我们要一路沿着珠江边走，毫无顾忌地饮酒。话题要漫无目的，像鱼在海里游泳',
    '我们会在第一个路口进入那家装修复古的甜品店。黄油多士小小一块，配着啤酒，怎么吃都吃不够。然后真就随便走',
    '在二个路口，我们要穿过暗巷里无数的冰室，一路走到沙面岛。路过晦暗的珠江、走过游轮的长队、看世纪砖楼前百年榕树的千千垂丝',
    '在最后一个路口，我们会仰望绵延千里的骑楼街，去底下的一家咖啡店买两杯馥芮白，在等待窗口前站五分钟',
    '我们会无聊，所以我会碰碰你的肩，你会摸摸我的头。而这样细微的触动，会让五分钟的等待有了无限意义',
    '蒋伯驾，我把房子都给你打扫好了。你回来，看我一眼呗',
    '如果到离别的那一天，我也想用三千年前的语调郑重地对你讲出那一句：再见',
    '蒋伯驾，我有这个荣幸，让你感到幸福吗',
    '那就一起赎罪吧'
  ];

  const CONFIG = {
    spawnMs: 340,        // 每多少毫秒尝试冒出一个方框
    lifeMs: 7000,        // 每个方框停留多久（之后淡出）
    maxBubbles: 20,      // 屏幕上最多同时存在几个
    targetBubbles: 20,   // 想凑到几个（挤不下时会放宽重叠）
    overlapRatio: 0.16,  // 允许和新方框重叠的面积比例
    photoBand: 'center', // 图片区域：'center' = 中间完整图，'full' = 整屏铺满
    order: 'random'      // 'random' 随机 / 'sequence' 按上面顺序
  };

  /* 美拉德色系：奶咖、焦糖、燕麦、榛果 */
  const COLORS = [
    [245, 233, 216], [238, 224, 203], [230, 213, 188], [222, 202, 172],
    [213, 187, 152], [205, 176, 138], [196, 163, 122], [232, 216, 196],
    [224, 199, 170], [216, 186, 151], [207, 172, 133], [199, 158, 115],
    [246, 237, 226], [236, 218, 197], [226, 203, 176], [214, 186, 156],
    [203, 169, 135], [241, 226, 210], [233, 210, 187], [221, 195, 168]
  ];

  const HOLD_MS = 1500;          // 长按多久算验证通过
  const RING_LENGTH = 339.292;   // 2π × 54（指纹外圈半径）

  /* ===================== 元素 ===================== */

  const welcome = document.getElementById('welcome');
  const scan = document.getElementById('scan');
  const startBtn = document.getElementById('startBtn');
  const printBox = document.getElementById('printBox');
  const ringFg = document.getElementById('ringFg');
  const ripple = document.getElementById('ripple');
  const musicBtn = document.getElementById('musicBtn');
  const audio = document.getElementById('bgm');
  const decor = document.getElementById('decor');
  const wallBg = document.getElementById('wallBg');

  /* ===================== 背景装饰 ===================== */

  function buildStars() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 36; i++) {
      const s = document.createElement('span');
      const size = 1 + Math.random() * 2.2;
      s.className = 'star';
      s.style.cssText =
        'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
        'left:' + (Math.random() * 100).toFixed(2) + '%;' +
        'top:' + (Math.random() * 100).toFixed(2) + '%;' +
        'animation-delay:' + (-Math.random() * 3).toFixed(2) + 's;' +
        'opacity:' + (0.3 + Math.random() * 0.55).toFixed(2);
      frag.appendChild(s);
    }
    decor.appendChild(frag);
  }

  function buildRain() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function drop() {
      const d = document.createElement('span');
      const len = 26 + Math.random() * 40;
      d.className = 'rain';
      d.style.cssText =
        'left:' + (Math.random() * 108 - 2).toFixed(2) + '%;' +
        'height:' + len.toFixed(1) + 'px;' +
        'width:' + (1.8 + Math.random() * 1.2).toFixed(1) + 'px;' +
        'animation-duration:' + (0.8 + Math.random() * 0.55).toFixed(2) + 's;';
      d.addEventListener('animationend', function () { d.remove(); });
      decor.appendChild(d);
      setTimeout(function () { d.remove(); }, 3000); // 兜底清理
    }

    // 开场先来一阵，避免刚进页面时干等
    for (let i = 0; i < 16; i++) {
      setTimeout(drop, i * 55);
    }
    setInterval(drop, 50);
  }

  /* ===================== 指纹长按验证 ===================== */

  var holdStart = 0;
  var rafId = 0;
  var holding = false;
  var verified = false;

  function ringProgress(p) {
    ringFg.style.strokeDashoffset = String(RING_LENGTH * (1 - p));
  }

  function onHoldStart(e) {
    if (verified) return;
    if (e && e.cancelable) e.preventDefault();
    holding = true;
    holdStart = performance.now();
    printBox.classList.add('pressing');
    ringFg.classList.remove('returning');

    ripple.classList.remove('go');
    void ripple.offsetWidth; // 重启动画
    ripple.classList.add('go');

    rafId = requestAnimationFrame(tick);
  }

  function tick() {
    if (!holding) return;
    var p = Math.min((performance.now() - holdStart) / HOLD_MS, 1);
    ringProgress(p);
    if (p >= 1) {
      onHoldEnd(true);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function onHoldEnd(ok) {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(rafId);
    printBox.classList.remove('pressing');

    if (ok && !verified) {
      verified = true;
      ringProgress(1);
      printBox.classList.add('success');
      setTimeout(goToLetter, 780);
    } else if (!verified) {
      // 没按满：进度条缩回去
      ringFg.classList.add('returning');
      ringProgress(0);
    }
  }

  ['pointerdown'].forEach(function (ev) {
    printBox.addEventListener(ev, onHoldStart);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    printBox.addEventListener(ev, function () { onHoldEnd(false); });
  });
  printBox.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ===================== 音乐 ===================== */

  var musicReady = true;
  var stageStarted = false;

  function startMusic() {
    if (!musicReady) return;
    audio.volume = 0.55;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        musicBtn.hidden = false;
      }).catch(function () {
        // 只有在确实读不到音频文件时才藏起按钮；
        // 被浏览器拦了自动播放的话，按钮留着让用户自己点
        if (audio.error) {
          musicReady = false;
          musicBtn.hidden = true;
        }
      });
    } else {
      musicBtn.hidden = false;
    }
  }

  audio.addEventListener('playing', function () {
    musicBtn.hidden = false;
  });

  // 音乐文件就绪后再显示按钮（避免空按钮，也避免在欢迎页就冒出来）
  audio.addEventListener('canplay', function () {
    if (musicReady && stageStarted) musicBtn.hidden = false;
  });

  musicBtn.addEventListener('click', function () {
    if (audio.paused) {
      startMusic();
      musicBtn.classList.remove('paused');
    } else {
      audio.pause();
      musicBtn.classList.add('paused');
    }
  });

  audio.addEventListener('error', function () {
    musicReady = false;
    musicBtn.hidden = true;
  });

  /* ===================== 方框（气泡）模式 ===================== */

  var live = [];
  var presentTexts = {};
  var seq = 0;
  var spawnTimer = 0;

  var query = new URLSearchParams(location.search);
  var order = query.get('order') === 'sequence' ? 'sequence' : CONFIG.order;

  // 同一时间屏幕上不允许出现两句相同的话：
  // 只从未出现在屏幕上的文案里挑，全都在屏上就先不生成
  function nextWish() {
    var shown = presentTexts;

    var pool = [];
    for (var k = 0; k < WISHES.length; k++) {
      if (!shown[WISHES[k]]) pool.push(WISHES[k]);
    }
    if (!pool.length) return null;

    if (order === 'sequence') {
      for (var s = 0; s < WISHES.length; s++) {
        var t = WISHES[(seq + s) % WISHES.length];
        if (!shown[t]) {
          seq = seq + s + 1;
          return t;
        }
      }
      return null;
    }

    return pool[(Math.random() * pool.length) | 0];
  }

  function overlapArea(a, b) {
    var w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    var h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 0 && h > 0 ? w * h : 0;
  }

  function spawn() {
    if (document.hidden) return;
    if (live.length >= CONFIG.maxBubbles) return; // 屏上已经够多了

    var wish = nextWish();
    if (!wish) return; // 屏幕上已经没有不重复的文案了，等下一轮

    var W = window.innerWidth;
    var H = window.innerHeight;

    var b = document.createElement('div');
    b.className = 'bubble';

    var inner = document.createElement('div');
    inner.className = 'bubble-inner';

    var tag = document.createElement('span');
    tag.className = 'bubble-tag';
    tag.textContent = NAME;

    var text = document.createElement('span');
    text.className = 'bubble-text';
    text.textContent = wish;

    inner.appendChild(tag);
    inner.appendChild(text);
    b.appendChild(inner);

    b.style.visibility = 'hidden';
    document.body.appendChild(b);

    var w = b.offsetWidth;
    var h = b.offsetHeight;

    // 位置：在网格锚点上找一块没被占用的地方
    var pad = 12;
    var maxX = Math.max(pad, W - w - pad);
    var minY = 62;
    var maxY = Math.max(minY, H - h - 36);

    var anchors = [];
    for (var ay = minY; ay <= maxY; ay += 26) {
      for (var ax = pad; ax <= maxX; ax += 26) {
        anchors.push([ax, ay]);
      }
    }
    // 打乱锚点顺序，避免每次从左上角开始
    for (var i = anchors.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var tmp = anchors[i];
      anchors[i] = anchors[j];
      anchors[j] = tmp;
    }

    var chosen = null;
    var bestRect = null;
    var bestWorst = Infinity;
    var area = w * h;
    var tolerance = area * CONFIG.overlapRatio + 300;

    for (var n = 0; n < anchors.length; n++) {
      var x = anchors[n][0] + (Math.random() * 10 - 5);
      var y = anchors[n][1] + (Math.random() * 10 - 5);
      x = Math.max(pad, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));

      var rect = { left: x, top: y, right: x + w, bottom: y + h };
      var worst = 0;

      for (var m = 0; m < live.length; m++) {
        var ov = overlapArea(rect, live[m].rect);
        if (ov > worst) worst = ov;
      }

      if (worst <= tolerance) { chosen = rect; break; }
      if (worst < bestWorst) { bestWorst = worst; bestRect = rect; }
    }

    // 为了凑够 targetBubbles，实在没空位时退而求其次，用最不挤的那个位置
    if (!chosen && bestRect && live.length < CONFIG.targetBubbles && bestWorst <= area * 0.36) {
      chosen = bestRect;
    }

    if (!chosen) {
      b.remove();
      return; // 屏幕上已经很挤，等下一轮
    }

    b.style.left = chosen.left + 'px';
    b.style.top = chosen.top + 'px';
    b.style.visibility = '';

    // 只有压在图片上的方框稍微透一点，其余保持正常
    var overImage = CONFIG.photoBand === 'full';
    if (CONFIG.photoBand === 'center') {
      var bandH = Math.min(H, W * 0.75);
      var bandTop = (H - bandH) / 2;
      overImage = chosen.top + h > bandTop && chosen.top < bandTop + bandH;
    }

    var c = COLORS[(Math.random() * COLORS.length) | 0];
    var alpha = overImage ? 0.84 : 0.94;
    b.style.setProperty(
      '--bubble-bg',
      'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')'
    );

    b.style.setProperty('--float-dur', (3.2 + Math.random() * 1.8).toFixed(2) + 's');
    b.style.setProperty('--float-delay', (-Math.random() * 3).toFixed(2) + 's');
    b.style.setProperty('--float-y', (-5 - Math.random() * 8).toFixed(1) + 'px');

    requestAnimationFrame(function () { b.classList.add('in'); });

    var item = { el: b, rect: chosen, text: wish, timer: 0, done: false };
    live.push(item);
    presentTexts[wish] = (presentTexts[wish] || 0) + 1;

    // 点一下方框：立刻碎掉消失
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      retire(item, true);
    });

    if (live.length > CONFIG.maxBubbles) {
      retire(live[0]);
    }

    item.timer = setTimeout(function () {
      retire(item);
    }, CONFIG.lifeMs + Math.random() * 2500);
  }

  function retire(item, pop) {
    if (!item || item.done) return;
    item.done = true;
    clearTimeout(item.timer);
    item.el.classList.add(pop ? 'pop' : 'out');

    var idx = live.indexOf(item);
    if (idx > -1) live.splice(idx, 1);

    setTimeout(function () {
      item.el.remove();
      // 等它真的从画面上消失，才允许同一句话再次出现
      if (presentTexts[item.text]) {
        presentTexts[item.text]--;
        if (presentTexts[item.text] <= 0) delete presentTexts[item.text];
      }
    }, pop ? 380 : 750);
  }

  function startLetter() {
    stageStarted = true;
    document.body.classList.add('in-wall');
    startMusic();

    setTimeout(spawn, 40);
    setTimeout(spawn, 260);
    setTimeout(spawn, 520);
    spawnTimer = setInterval(spawn, CONFIG.spawnMs);
  }

  /* ===================== 页面流程 ===================== */

  function goToLetter() {
    scan.classList.add('hide');
    setTimeout(function () {
      scan.hidden = true;
    }, 600);
    // 背景图跟着卡片一起淡入
    wallBg.classList.add('show');
    // 在卡片淡出的同时开始冒方框，衔接更自然
    setTimeout(startLetter, 380);
  }

  // iOS 只允许在用户手势里启动音频：
  // 点「开始查看」时先静音试播一次再暂停，第三段才能真正自动播放
  var audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    var v = audio.volume;
    audio.volume = 0;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = v;
      }).catch(function () {
        audio.volume = v;
      });
    } else {
      audio.volume = v;
    }
  }

  startBtn.addEventListener('click', function () {
    unlockAudio();
    welcome.classList.add('hide');
    setTimeout(function () { welcome.hidden = true; }, 500);
    scan.hidden = false;
  });

  /* ===================== 调试用 ?preview= ===================== */

  var preview = query.get('preview');
  if (preview) {
    welcome.hidden = true;
    if (preview === 'scan') {
      scan.hidden = false;
    } else if (preview === 'wall') {
      scan.hidden = true;
      wallBg.classList.add('show');
      startLetter();
    }
  }

  /* ===================== 启动 ===================== */

  buildStars();
  buildRain();
})();

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextbtn = $(".btn-next");
const prebtn = $(".btn-prev");
const randombtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},

  songs: [
    {
      id: 1,
      name: "Goddamnn",
      singer: "Tyga",
      path: "../assets/music/1Goddamnn-Tyga.mp3",
      image: "../assets/imgs/Son-Tung-1.jpg",
    },
    {
      id: 2,
      name: "LemonTree",
      singer: "Volker Hinkel",
      path: "../assets/music/2LemonTreeRemix.mp3",
      image: "../assets/imgs/Son-Tung-2.jpg",
    },
    {
      id: 3,
      name: "Em của ngày hôm qua",
      singer: "Sơn Tùng",
      path: "../assets/music/3EmCuaNgayHomQua.mp3",
      image: "../assets/imgs/Son-Tung-3.jpg",
    },
    {
      id: 4,
      name: "Nevada",
      singer: "Vicetone ",
      path: "../assets/music/4Nevada.mp3",
      image: "../assets/imgs/Son-Tung-4.jpg",
    },
    {
      id: 5,
      name: "So Far Away",
      singer: "Martin Garrix",
      path: "../assets/music/5SoFarAway-MartinGarrix.mp3",
      image: "../assets/imgs/Son-Tung-5.jpg",
    },
    {
      id: 6,
      name: "Swish",
      singer: "Tyga",
      path: "../assets/music/6Swish-Tyga.mp3",
      image: "../assets/imgs/Son-Tung-6.jpg",
    },
    {
      id: 7,
      name: "Taste",
      singer: "Tyga",
      path: "../assets/music/7Taste.mp3",
      image: "../assets/imgs/Son-Tung-7.jpg",
    },
    {
      id: 8,
      name: "There For You",
      singer: "Martin Garrix",
      path: "../assets/music/8ThereForYou-MartinGarrix.mp3",
      image: "../assets/imgs/Son-Tung-8.jpg",
    },
  ],

  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return ` 
        <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
            <div
              class="thumb"
              style="
                background-image: url('${song.image}');
              "
            ></div>

            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>

            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        `;
    });
    playlist.innerHTML = htmls.join(" ");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdwidth = cd.offsetWidth;

    //xử lý đĩa quay
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to/thu nhỏ khi scroll
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newcdwidth = cdwidth - scrollTop;
      cd.style.width = newcdwidth > 0 ? newcdwidth + "px" : 0;
      cd.style.opacity = newcdwidth / cdwidth;
    };

    // Xử lý click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //khi song dc play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    //khi song dc pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPersen = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPersen;
      }
    };

    //Xử lý khi tua song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //khi next song
    nextbtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // khi prev song
    prebtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //khi random song
    randombtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randombtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextbtn.onclick();
      }
    };

    // Xử lý lặp lại song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);

      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // lắng nghe sự kiện click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        // Handle when clicking on the song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        // Handle when clicking on the song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  start: function () {
    this.loadConfig();

    this.render();

    this.handleEvents();

    this.defineProperties();

    this.loadCurrentSong();

    randombtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();

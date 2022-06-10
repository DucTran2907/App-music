/*
    1. Render songs -> done
    2. Scroll top -> done
    3. Play / pause / seek -> done
    4. CD rotate -> done
    5. Next / prev ->done
    6. Random -> done
    7. Next / Repeat when ended -> done
    8. Active song -> done
    9. Scroll active song into view -> done 
    10. play song when click -> done
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const MinhDucPlayer = 'Minh Duc Player';

const player = $('.player');
const playList = $('.playlist');
const cdThumb = $('.cd-thumb');
const cd = $('.cd');
const heading = $('header h2');
const audio = $('#audio');
const btnPlay = $('.btn-toggle-play');
const btnNext = $('.btn-next');
const btnPrevious = $('.btn-prev');
const btnRepeat = $('.btn-repeat');
const progress = $('.progress');
const btnRandom = $('.btn-random'); 
const option = $('.option');
const volume = $('.volume');
//console.log(btnRepeat);

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(MinhDucPlayer)) || {},
    randomSongArray: [],
    songs: [
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './asset/music/song1.mp3',
            image: './asset/img/song1.jpg'
        },

        {
            name: 'SummerTime',
            singer: 'K-319',
            path: './asset/music/song2.mp3',
            image: './asset/img/song2.jpg'
        },

        {
            name: 'Monody',
            singer: 'TheFatRat',
            path: './asset/music/song3.mp3',
            image: './asset/img/song3.jpg'
        },

        {
            name: 'Reality',
            singer: 'Lost Frequencies',
            path: './asset/music/song4.mp3',
            image: './asset/img/song4.jpg'
        },

        {
            name: 'Lối Nhỏ',
            singer: 'Đen - Lối Nhỏ ft. Phương Anh Đào',
            path: './asset/music/song5.mp3',
            image: './asset/img/song5.jpg'
        },

        {
            name: 'Lemon tree',
            singer: 'Fools Garden',
            path: './asset/music/song6.mp3',
            image: './asset/img/song6.jpg'
        },

        {
            name: 'Sugar',
            singer: 'Maroon 5',
            path: './asset/music/song7.mp3',
            image: './asset/img/song7.jpg'
        },

        {
            name: 'My love',
            singer: 'Westlife',
            path: './asset/music/song8.mp3',
            image: './asset/img/song8.jpg'
        },

        {
            name: 'Attention',
            singer: 'Charlie Puth',
            path: './asset/music/song9.mp3',
            image: './asset/img/song9.jpg'
        },
        

        {
            name: 'Monster',
            singer: 'Charlie Puth',
            path: './asset/music/song10.mp3',
            image: './asset/img/song10.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(MinhDucPlayer, JSON.stringify(this.config));
    },

    loadConfig: function() {
        if (this.config.random !== undefined) {
            this.isRandom = this.config.random;
            btnRandom.classList.toggle('active', this.isRandom);
        }
        if (this.config.repeat !== undefined) {
            this.isRepeat = this.config.repeat;
            btnRepeat.classList.toggle('active', this.isRepeat);
        }
        if (this.config.volume !== undefined) {
            audio.volume = this.config.volume;
            volume.value = audio.volume * 100;
        }

        if (this.config.currentSong !==undefined) {
            this.currentIndex = this.config.currentSong;
            this.loadCurrentSong();
        }
    },

    renderSong: function() {
        const htmls = this.songs.map(function(song, index) {
            return `
                <div class="song" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
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

        playList.innerHTML = htmls.join('');
    },

    // define properties
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong' ,{
            get: function() {
                return this.songs[this.currentIndex];
            },
        });
    },

    //handle events
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // rotating CD
        const cdThumbAnimate =  cd.animate([
            { transform: 'rotate(360deg)' }
        ],{
            duration: 10000,
            iterations: Infinity
        });

        cdThumbAnimate.pause();

        // handle when scrolling app
        document.onscroll = function() {
            const scrollTop = window.scrollY  || document.documentElement.scrollTop;
            const newCdWidth = (cdWidth - scrollTop > 0) ? cdWidth - scrollTop : 0;
            cd.style.width = newCdWidth + 'px';
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // handle when click button play
        btnPlay.onclick = function() {
            _this.isPlaying = !_this.isPlaying;
            player.classList.toggle('playing', _this.isPlaying);
            if (_this.isPlaying) {
                _this.playSong();
                cdThumbAnimate.play();
            }
            else if(!_this.isPlaying) {
                _this.pauseSong();
                cdThumbAnimate.pause();
            }
        };

        // handle when the current playback position has changed
        audio.ontimeupdate = function() {
            _this.progressSong();
        };

        // handle when seek the current song
        progress.oninput = function() {
            const timeSeekPercent = progress.value;
            _this.seekSong(timeSeekPercent);
        };

        // handle when click next button
        btnNext.onclick = function() {
            if (!_this.isRandom) {
                _this.nextSong();
            }
            else if (_this.isRandom) {
                _this.randomSong();
            }

            if (_this.isPlaying) {
                _this.playSong();
            }

            _this.setConfig('currentSong', _this.currentIndex);
        };

        // handle when click previous button
        btnPrevious.onclick = function() {
            if (!_this.isRandom) {
                _this.previousSong();
            }
            else if (_this.isRandom) {
                _this.randomSong();
            }

            if(_this.isPlaying) {
                _this.playSong();
            }

            _this.setConfig('currentSong', _this.currentIndex);
        };

        // handle when click random button
        btnRandom.onclick = function() {
            _this.isRandom = !_this.isRandom;
            btnRandom.classList.toggle('active', _this.isRandom);
            _this.setConfig('random', _this.isRandom);
        };

        // handle when click repeat button
        btnRepeat.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            btnRepeat.classList.toggle('active', _this.isRepeat);
            _this.setConfig('repeat', _this.isRepeat);
        };

        // handle when audio is ended
        audio.onended = function() {
            if (!_this.isRepeat) {
                btnNext.click();
            }
            else if (_this.isRepeat) {
                _this.playSong();
            }
        };

        // handle when click playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song');
            const numberSongClick = Number(songNode.dataset.index);
            if (e.target.closest('.option')) {
                console.log('option');
            }
            else if (songNode && numberSongClick !== _this.currentIndex) {
                _this.currentIndex = numberSongClick;
                _this.loadCurrentSong();
                if (_this.isPlaying) {
                    _this.playSong();
                }
            }
        };  

        // handle when input volume has changed
        volume.oninput = function() {
            audio.volume = this.value / 100;
            _this.setConfig('volume', audio.volume);
        }
    },

    // load current song
    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = `${this.currentSong.path}`;
        this.activeSong();
    },

    // active song
    activeSong: function() {
        const _this= this;
        const songs = $$('.song');
        songs.forEach(function(song, index) {
            if (index === _this.currentIndex) {
                song.classList.add('active');
                _this.scrollSong(song);
            }
            else if (index !== _this.currentIndex) {
                song.classList.remove('active');
            }
        });
    },

    // scroll song in center 
    scrollSong: function(element) {
        if (this.currentIndex >= 2) {
            setTimeout(function() {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 100);
        } 
        else if (this.currentIndex < 2) {
            setTimeout(function() {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "end"
                });
            }, 100);
        }
    },

    // play the song
    playSong: function() {
        audio.play();
    },

    // pause the song
    pauseSong: function() {
        audio.pause();
    },


    // next the song
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        
    },

    // previous the song
    previousSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        
    },


    // random the song
    randomSong: function() {
        let randomNumber;
        let foundSong;
        do {
            randomNumber = Math.floor(Math.random() * this.songs.length);
            foundSong = this.randomSongArray.find(function(random) {
                return randomNumber === random;
            });
        }
        while(randomNumber === this.currentIndex || foundSong !== undefined);
        this.randomSongArray.push(randomNumber);
        this.currentIndex = randomNumber;
        console.log(this.randomSongArray);
        this.loadCurrentSong();
        if (this.randomSongArray.length === this.songs.length) {
            this.randomSongArray = [];
        }
    },

    // show progress of song
    progressSong: function() {
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        if (duration) {
            const currentTimePercent = Math.floor(currentTime / duration * 100);
            progress.value = currentTimePercent;
        }
    },

    // seek the song
    seekSong: function(timeSeekPercent) {
        const duration = audio.duration;
        audio.currentTime = Math.floor(timeSeekPercent * duration / 100);
    },

    // start the App
    start: function() {
        // render play list songs
        this.renderSong();

        // define properties of app
        this.defineProperties();
        
        // load current song
        this.loadCurrentSong();

        // handle dom events
        this.handleEvents();

        // load config
        this.loadConfig();
        
    }
}

// run the main
app.start();

// function check object is empty
/*function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}*/



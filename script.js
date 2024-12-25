const BASE_URL = "https://yourxayush.github.io/SPOTIFY_CLONE";
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    try {
        let a = await fetch(`${BASE_URL}/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        console.log(anchors);
        let square_Container = document.querySelector(".square_container");
        let array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0];
                console.log(folder);
                let a = await fetch(`${BASE_URL}/songs/${folder}/info.json`);
                let response = await a.json();

                console.log(response);
                square_Container.innerHTML += `
                    <div data-folder="${folder}" class="card_song">
                        <div><img src="new.svg" alt="play button" class="green"></div>
                        <img src="${BASE_URL}/songs/${folder}/cover.jpg" alt="image">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
            }
        }

        Array.from(document.getElementsByClassName("card_song")).forEach(e => {
            e.addEventListener("click", async (item) => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function getSongs(folder) {
    currFolder = folder;

    try {
        let a = await fetch(`${BASE_URL}/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        if (songs.length === 0) {
            console.error("No songs found in folder:", folder);
        }

        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <div class="songbox_cont">
                        <div class="playsong_box">
                            <img src="music.svg" alt="music" class="left_music">
                            <div class="song_info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>AYUSH</div>
                            </div>
                        </div>
                        <div class="play_it">
                            <span>Play Now</span>
                            <img src="play.svg" alt="play button">
                        </div>
                    </div>
                </li>`;
        }

        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                let trackName = e.querySelector(".song_info").firstElementChild.innerHTML;
                playMusic(trackName);
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

const playMusic = (track, pause = false) => {
    if (!track || !currFolder) {
        console.error("Invalid track or folder:", track, currFolder);
        return;
    }

    currentSong.pause();
    currentSong.src = `${BASE_URL}/${currFolder}/` + encodeURIComponent(track.trim());
    currentSong.currentTime = 0;

    document.querySelector(".playbar_infor").innerHTML = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    if (!pause) {
        currentSong.play().catch((error) => {
            console.error("Error during playback:", error);
        });
        play.src = "pause.svg";
    } else {
        play.src = "new.svg";
    }

    currentSong.onended = () => {
        play.src = "new.svg";
    };
};

async function main() {
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "new.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let position = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = position + "%";
        currentSong.currentTime = ((currentSong.duration) * position) / 100;
    });

    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        if (currentIndex >= 0 && currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    vol.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            vol.value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            vol.value = 10;
        }
    });
}

main();

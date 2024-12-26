const BASE_URL = "https://yourxayush.github.io/SPOTIFY_CLONE";
let currentSong = new Audio();
let songs = [];
let currFolder = "";

const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const vol = document.getElementById("vol");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function fetchJSON(file) {
    try {
        const response = await fetch(`${BASE_URL}/${file}`);
        if (!response.ok) throw new Error(`Failed to fetch JSON: ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch JSON ${file}:`, error);
        return null;
    }
}

async function displayAlbums() {
    try {
        const squareContainer = document.querySelector(".square_container");
        const folders = ["Honey", "Arijit", "Badshah", "Diljit Dosanjh", "Karan Aujla", "Lua Dipa"];

        for (const folder of folders) {
            const info = await fetchJSON(`songs/${folder}/info.json`);
            if (!info) continue;

            squareContainer.innerHTML += `
                <div data-folder="${folder}" class="card_song">
                    <div><img src="new.svg" alt="play button" class="green"></div>
                    <img src="${BASE_URL}/songs/${folder}/cover.jpg" alt="image">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        }

        Array.from(document.getElementsByClassName("card_song")).forEach(e => {
            e.addEventListener("click", async (item) => {
                const folder = item.currentTarget.dataset.folder;
                if (folder) {
                    songs = await getSongs(folder, `songs/${folder}/info.json`);
                    if (songs.length > 0) playMusic(songs[0]);
                } else {
                    console.error("Folder name is undefined!");
                }
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function getSongs(folder, infoFile) {
    try {
        currFolder = folder;
        const info = await fetchJSON(infoFile);
        if (!info || !info.songs) return [];

        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of info.songs) {
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

            const songItem = songUL.lastElementChild;
            songItem.addEventListener("click", () => {
                playMusic(song, false, folder);
            });
        }
        return info.songs;
    } catch (error) {
        console.error(`Error fetching songs from ${folder}:`, error);
        return [];
    }
}

function playMusic(track, pause = false, folder = currFolder) {
    if (!track || !folder) {
        console.error("Invalid track or folder:", track, folder);
        return;
    }

    currentSong.pause();
    const trackUrl = `${BASE_URL}/songs/${folder}/${encodeURIComponent(track.trim())}`;
    currentSong.src = trackUrl;
    currentSong.currentTime = 0;

    document.querySelector(".playbar_infor").innerText = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

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

    currentSong.onerror = () => {
        console.error("Song file not found:", trackUrl);
        alert("This Song is not available.");
    };
}

async function main() {
    const defaultFolder = "Honey";
    const defaultInfo = await fetchJSON(`songs/${defaultFolder}/info.json`);
    if (defaultInfo) {
        songs = await getSongs(defaultFolder, `songs/${defaultFolder}/info.json`);
        if (songs.length > 0) {
            playMusic(songs[0], true);
        }
    }

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
        const current = currentSong.currentTime;
        const total = currentSong.duration;
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(current)} / ${secondsToMinutesSeconds(total)}`;
        document.querySelector(".circle").style.left = `${(current / total) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const position = e.offsetX / e.target.offsetWidth;
        currentSong.currentTime = position * currentSong.duration;
    });

    previous.addEventListener("click", () => {
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex > 0) playMusic(songs[currentIndex - 1]);
    });

    next.addEventListener("click", () => {
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex >= 0 && currentIndex < songs.length - 1) playMusic(songs[currentIndex + 1]);
    });

    vol.addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    document.querySelector(".volume").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            vol.value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            vol.value = 10;
        }
    });
}

main();

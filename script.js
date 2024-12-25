// Updated Script for Spotify Clone
const BASE_URL = "https://yourxayush.github.io/SPOTIFY_CLONE"; // Base URL for GitHub Pages
let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Converts seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch folder contents
async function fetchFolder(folder) {
    try {
        const response = await fetch(`${BASE_URL}/${folder}/`);
        if (!response.ok) throw new Error(`Failed to load folder: ${folder}`);
        return await response.text();
    } catch (error) {
        console.error(`Failed to fetch folder ${folder}:`, error);
        return null;
    }
}

// Fetch a JSON file
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

// Display album cards
async function displayAlbums() {
    try {
        const folderHTML = await fetchFolder("songs");
        if (!folderHTML) return;

        const div = document.createElement("div");
        div.innerHTML = folderHTML;
        const anchors = div.getElementsByTagName("a");
        const squareContainer = document.querySelector(".square_container");

        for (const anchor of anchors) {
            if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
                const folder = anchor.href.split("/").slice(-2)[0];
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
        }

        // Add click listeners to album cards
        Array.from(document.getElementsByClassName("card_song")).forEach(e => {
            e.addEventListener("click", async (item) => {
                const folder = item.currentTarget.dataset.folder;
                songs = await getSongs(`songs/${folder}`);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

// Fetch and display songs
async function getSongs(folder) {
    try {
        currFolder = folder;
        const info = await fetchJSON(`${folder}/info.json`);
        if (!info || !info.songs) return [];

        songs = info.songs;
        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";

        songs.forEach(song => {
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
        });

        // Add click listeners to song items
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                playMusic(songs[index]);
            });
        });

        return songs;
    } catch (error) {
        console.error(`Error fetching songs from ${folder}:`, error);
        return [];
    }
}

// Play a song
function playMusic(track, pause = false) {
    if (!track || !currFolder) {
        console.error("Invalid track or folder:", track, currFolder);
        return;
    }

    currentSong.pause();
    currentSong.src = `${BASE_URL}/${currFolder}/` + encodeURIComponent(track.trim());
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
}

// Main function to initialize the app
async function main() {
    await displayAlbums();

    // Play/pause button functionality
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "new.svg";
        }
    });

    // Update time and seek bar during playback
    currentSong.addEventListener("timeupdate", () => {
        const current = currentSong.currentTime;
        const total = currentSong.duration;
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(current)} / ${secondsToMinutesSeconds(total)}`;
        document.querySelector(".circle").style.left = (current / total) * 100 + "%";
    });

    // Seek functionality
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const position = e.offsetX / e.target.offsetWidth;
        currentSong.currentTime = position * currentSong.duration;
    });

    // Previous song functionality
    previous.addEventListener("click", () => {
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex > 0) playMusic(songs[currentIndex - 1]);
    });

    // Next song functionality
    next.addEventListener("click", () => {
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex >= 0 && currentIndex < songs.length - 1) playMusic(songs[currentIndex + 1]);
    });

    // Volume control
    vol.addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Mute/unmute functionality
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

const BASE_URL = "https://yourxayush.github.io/SPOTIFY_CLONE";
let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
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
        const folders = ["Honey", "Arijit", "Badshah", "Diljit Dosanjh", "Karan Aujla", "Lua Dipa"]; // Add your folder names here manually

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
                if (folder) { // Check if folder is defined
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

// Adding the search functionality
document.getElementById("search_input").addEventListener("input", async function() {
    const query = this.value.toLowerCase(); // Get the query from the search bar

    // If there are no songs, do nothing
    if (!songs || songs.length === 0) return;

    // Filter songs based on the search query
    const filteredSongs = songs.filter(song => 
        song.toLowerCase().includes(query) // Case-insensitive search
    );

    // Update the song list with filtered songs
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear the current list

    // Display the filtered songs
    if (filteredSongs.length > 0) {
        filteredSongs.forEach(song => {
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

        // Add event listeners to the new dynamically added songs
        Array.from(songUL.getElementsByTagName("li")).forEach((item, index) => {
            item.addEventListener("click", () => {
                playMusic(filteredSongs[index]);
            });
        });
    } else {
        songUL.innerHTML = "<li>No songs found</li>";
    }
});



async function getSongs(folder, infoFile) {
    try {
        currFolder = folder;
        console.log("Fetching songs from folder:", folder);  // Debugging line
        const info = await fetchJSON(infoFile);
        if (!info || !info.songs) return [];


        songs = info.songs;

        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (let i=0 ; i< songs.length; i++) {
            const song =songs[i];
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

        const songItem = songUL.lastElementChild;
        songIem.addEventListener("click", ()=>{
            playMusic(song, false, folder);
        });

        return songs;
    } catch (error) {
        console.error(`Error fetching songs from ${folder}:`, error);
        return [];
    }
}

function playMusic(track, pause = false, folder=currFolder) {
    if (!track || !currFolder) {
        console.error("Invalid track or folder:", track, currFolder);
        return;
    }

    currentSong.pause();
    currentSong.src = `${BASE_URL}/songs/${currFolder}/` + encodeURIComponent(track.trim());
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

async function main() {

    const defaultFolder = "Honey";  // Set the default folder to play music from
    const defaultInfo = await fetchJSON(`songs/${defaultFolder}/info.json`);
    if (defaultInfo) {
        songs = await getSongs(defaultFolder, `songs/${defaultFolder}/info.json`);
        if (songs.length > 0) {
            let music = decodeURIComponent(songs[0]);
            playMusic(music, true); // Load the first song without playing it
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
        document.querySelector(".circle").style.left = (current / total) * 100 + "%";
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

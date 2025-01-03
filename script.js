const BASE_URL = "https://yourxayush.github.io/SPOTIFY_CLONE";
let currentSong = new Audio();
let songs = [];
let currFolder = "";
let albumsRendered = false; // Prevent multiple album renders

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
    if (albumsRendered) return; // Prevent rendering albums again if already rendered

    try {
        const squareContainer = document.querySelector(".square_container");
        const folders = ["Honey", "Arijit","Lofi Songs", "Dance Song", "Badshah", "Diljit Dosanjh", "Karan Aujla", "Lua Dipa", "Shubh", "ANUV", "OLD SONGS", "SHREYA", "AP DHILLON", "NYOLIWALA" , "MASOOM"]; // Add your folder names here manually

        // Clear existing content to avoid duplication
        squareContainer.innerHTML = "";

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

        albumsRendered = true; // Mark albums as rendered
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function getSongs(folder, infoFile) {
    try {
        currFolder = folder;
        const info = await fetchJSON(infoFile);
        if (!info || !info.songs) return [];

        songs = info.songs;

        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = ""; // Clear the song list
        songs.forEach((song, index) => {
            songUL.innerHTML += `
                <li class="song_item">
                    <div class="songbox_cont">
                        <div class="playsong_box">
                            <img src="music.svg" alt="music" class="left_music">
                            <div class="song_info">
                                <div class="song_title">${song.replaceAll("%20", " ")}</div>
                                <div>SHOURYA</div>
                            </div>
                        </div>
                        <div class="play_it">
                            <span>Play Now</span>
                            <img src="play.svg" alt="play button">
                        </div>
                    </div>
                </li>`;
        });

        const listItems = songUL.getElementsByClassName("song_item");
        Array.from(listItems).forEach((item, index) => {
            item.addEventListener("click", () => {
                playMusic(songs[index], false, folder);
            });
        });

        return songs;
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

    currentSong.pause(); // Pause any currently playing song
    const trackUrl = `${BASE_URL}/songs/${folder}/${encodeURIComponent(track.trim())}`;
    currentSong.src = trackUrl; // Set the new track source
    currentSong.currentTime = 0;

    document.querySelector(".playbar_infor").innerText = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    if (!pause) {
        currentSong.play().catch((error) => {
            console.error("Error during playback:", error);
        });
        play.src = "pause.svg"; // Change button to "Pause"
    } else {
        play.src = "new.svg"; // Change button to "Play"
    }

    currentSong.onended = () => {
        play.src = "new.svg"; // Change the play button to "Play"
    
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex >= 0 && currentIndex < songs.length - 1) {
            // Play the next song if it's not the last song
            playMusic(songs[currentIndex + 1]);
        } else {
            // If it's the last song, reset to the first song (optional)
            playMusic(songs[0]);
        }
    

    };

    currentSong.onerror = () => {
        console.error("Song file not found:", trackUrl);
        alert("This song is not available.");
    };
}

async function main() {
    const defaultFolder = "Honey"; // Set the default folder to play music from
    const defaultInfo = await fetchJSON(`songs/${defaultFolder}/info.json`);
    if (defaultInfo) {
        songs = await getSongs(defaultFolder, `songs/${defaultFolder}/info.json`);
        if (songs.length > 0) {
            let music = decodeURIComponent(songs[0]);
            playMusic(music, true); // Load the first song without playing it
        }
    }

    await displayAlbums();

    // Play and Pause Button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg"; // Switch to pause icon
        } else {
            currentSong.pause();
            play.src = "new.svg"; // Switch to play icon
        }
    });

    // Update song time and progress
    currentSong.addEventListener("timeupdate", () => {
        const current = currentSong.currentTime;
        const total = currentSong.duration;
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(current)} / ${secondsToMinutesSeconds(total)}`;
        document.querySelector(".circle").style.left = (current / total) * 100 + "%";
    });

    // Seekbar click handler to change time
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const position = e.offsetX / e.target.offsetWidth;
        currentSong.currentTime = position * currentSong.duration;
    });

    // Play the previous song
    previous.addEventListener("click", () => {
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex > 0) playMusic(songs[currentIndex - 1]);
    });

    // Play the next song
    next.addEventListener("click", () => {
        const currentIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (currentIndex >= 0 && currentIndex < songs.length - 1) playMusic(songs[currentIndex + 1]);
    });

    // Volume control handler
    vol.addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Mute and unmute button
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

    // Search functionality for song titles in the left library
    document.querySelector("#search_input").addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const songItems = document.querySelectorAll(".song_item");
        songItems.forEach(item => {
            const songTitle = item.querySelector(".song_title").textContent.toLowerCase();
            if (songTitle.includes(searchTerm)) {
                item.style.display = "block"; // Show the song
            } else {
                item.style.display = "none"; // Hide the song
            }
        });
    });

   ayush.addEventListener("click", ()=>{
    document.querySelector(".left").style.left=0;
   })
   
   document.querySelector(".close").addEventListener("click", ()=>{
            document.querySelector(".left").style.left="-100%";
   })
   
   document.querySelector(".home").addEventListener("click", ()=>{
    document.querySelector(".left").style.left="-100%";
})

document.querySelector(".Goback").addEventListener("click", ()=>{
    document.querySelector(".left").style.left="-100%";
})

}

main();
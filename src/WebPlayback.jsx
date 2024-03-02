import React, { useState, useEffect } from 'react';
import axios from "axios";

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

// Define the function to select a track from the list
function getTrackUri() {
    // Logic to select a track from your list of tracks
    // For example, you might randomly select a track here
    // to play just one track, wrap it inside an array: https://github.com/spotify/web-api/issues/675 
    return ["spotify:track:1oz3gEoNWHAS3pjwThdSJb"];
}

// Function to play the track
async function playTrack(trackUri, accessToken) {
  try {
    const data = {
        context_uri: trackUri,
        offset: { "position": 0 }, // Start playing from the beginning of the track
        position_ms: 0
    };
    const response = await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      {"data": data},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Track is now playing:', response.data);
  } catch (error) {
    console.error('Error playing track:', error);
  }
}


function WebPlayback(props) {

    // State Variables 

    // is the playback paused or not
    const [is_paused, setPaused] = useState(false);
    // is the palyer instance active
    const [is_active, setActive] = useState(false);
    // holds the player instance
    const [player, setPlayer] = useState(undefined);
    // holds info about the current track 
    const [current_track, setTrack] = useState(track);

    useEffect(() => {

        // sets up the Spotify Web Player SDK by dynamically loading a script 
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            // sets up a player instance with authentication tokens 
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(player);
            console.log("Player set up.");

            // adds event listeners for ready, not_ready, player_state_changed
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                const trackUri = getTrackUri();
                console.log("Let's play this track: ", trackUri);
                playTrack(trackUri, props.token);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
            
            // when player state changes, update state variables by the current player state 
            player.addListener('player_state_changed', ( state => {
                
                console.log('state.track_window.current_track')
                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.connect();
        };
    }, [props.token]);

    // if player is not active, render message to transfer playback using Spotify App 
    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <div className="container">
                <div className="main-wrapper">
                    <div className="now-playing">
                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />
                        <div className="now-playing__info">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>
                        </div>
                    </div>
                    <div className="controls">
                        <button className="control-btn" onClick={() => { player.previousTrack() }} >
                            <i className="fas fa-backward"></i>
                        </button>
                        <button className="control-btn" onClick={() => { player.togglePlay() }} >
                            { is_paused ? <i className="fas fa-play"></i> : <i className="fas fa-pause"></i> }
                        </button>
                        <button className="control-btn" onClick={() => { player.nextTrack() }} >
                            <i className="fas fa-forward"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
        
    //     return (
    //         <>
    //             <div className="container">
    //                 <div className="main-wrapper">

    //                     <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

    //                     <div className="now-playing__side">
    //                         <div className="now-playing__name">{current_track.name}</div>
    //                         <div className="now-playing__artist">{current_track.artists[0].name}</div>

    //                         <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
    //                             &lt;&lt;
    //                         </button>

    //                         <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
    //                             { is_paused ? "PLAY" : "PAUSE" }
    //                         </button>

    //                         <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
    //                             &gt;&gt;
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         </>
    //     );
    }
}

export default WebPlayback
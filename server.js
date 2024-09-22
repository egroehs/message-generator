const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cors());

const client_id = "bdda6c6294744e038261ab524155ce5d";
const client_secret = "b2f99d28ca934d10ab369bfca4e63f6d";

// Get Spotify access token
const getAccessToken = async () => {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${client_id}:${client_secret}`).toString("base64")
    },
    data: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    method: "POST",
  };

  const response = await axios(authOptions);
  return response.data.access_token;
};

// Get a random track, artist, and album
app.get("/random", async (req, res) => {
  try {
    const token = await getAccessToken();
    
    // Fetch new releases
    const randomOffset = Math.floor(Math.random() * 100); 
     const options = {
       url: `https://api.spotify.com/v1/browse/new-releases?limit=10&offset=${randomOffset}`,
       headers: { Authorization: "Bearer " + token },
     };

    const response = await axios.get(options.url, { headers: options.headers });
    console.log("Spotify Response:", response.data); // Log the Spotify API response

    const albums = response.data.albums.items;
    if (albums.length === 0) {
      return res.status(404).json({ error: "No albums found" });
    }

    // Randomly select an album
    const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
    const randomArtist = randomAlbum.artists ? randomAlbum.artists[0] : null;
    console.log("Random Album:", randomAlbum);
    // If there's no artist, return a message
    if (!randomArtist) {
      return res.status(404).json({ error: "No artist found" });
    }

    // Fetch artist details using the artist's Spotify ID
    const artistOptions = {
      url: `https://api.spotify.com/v1/artists/${randomArtist.id}`,
      headers: { Authorization: "Bearer " + token },
    };

    const artistResponse = await axios.get(artistOptions.url, {
      headers: artistOptions.headers,
    });
    const artistData = artistResponse.data;

   const tracksResponse = await axios.get(
     `https://api.spotify.com/v1/albums/${randomAlbum.id}/tracks`,
     {
       headers: { Authorization: "Bearer " + token },
     }
   );

   const tracks = tracksResponse.data.items;
   console.log("Tracks Response:", tracksResponse.data);


   if (!tracks || tracks.length === 0) {
     return res.status(404).json({ error: "No tracks found in the album" });
   }

     res.json({
       track: tracks.length > 0 ? tracks[0].name : "No track found",
       artist: artistData.name,
       album: randomAlbum.name,
       artistDetails: artistData,
       albumCover: randomAlbum.images[0]?.url,
     });
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    res.status(400).json({ error: "Unable to fetch data" });
  }
});


const port = 5500;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
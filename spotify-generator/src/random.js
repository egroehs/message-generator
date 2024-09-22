import React, { useState } from "react";
import axios from "axios";

const RandomTrack = () => {
  const [trackInfo, setTrackInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomTrack = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5500/random");
      setTrackInfo(response.data);
    } catch (err) {
      console.error(err); // Log the error to the console
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Random Track</h1>
      <button onClick={fetchRandomTrack}>Get Random Track</button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {trackInfo && (
        <div>
          <h2>Song: {trackInfo.track}</h2>
          <h3>Artist: {trackInfo.artist}</h3>
          <p>Album: {trackInfo.album}</p>
        </div>
      )}
    </div>
  );
};

export default RandomTrack;

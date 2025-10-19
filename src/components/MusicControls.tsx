import { useMusicPlayer, SONGS } from './MusicPlayer';

export default function MusicControls() {
  const {
    isPlaying,
    volume,
    currentSong,
    isExpanded,
    togglePlay,
    setVolume,
    selectSong,
    setIsExpanded,
  } = useMusicPlayer();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const lofiSongs = SONGS.filter(s => s.genre === 'Lofi');
  const phonkSongs = SONGS.filter(s => s.genre === 'Phonk');

  return (
    <div className="music-controls">
      <div className="music-player-header">
        <button onClick={togglePlay} className="music-button">
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <div className="current-song">
          <div className="song-title">{currentSong.title}</div>
          <div className="song-genre">{currentSong.genre}</div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-button"
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="song-list">
          <div className="genre-section">
            <div className="genre-header">🎵 Lofi</div>
            {lofiSongs.map(song => (
              <button
                key={song.id}
                onClick={() => selectSong(song)}
                className={`song-item ${currentSong.id === song.id ? 'active' : ''}`}
              >
                {currentSong.id === song.id && '▶ '}
                {song.title}
              </button>
            ))}
          </div>

          <div className="genre-section">
            <div className="genre-header">🔥 Phonk</div>
            {phonkSongs.map(song => (
              <button
                key={song.id}
                onClick={() => selectSong(song)}
                className={`song-item ${currentSong.id === song.id ? 'active' : ''}`}
              >
                {currentSong.id === song.id && '▶ '}
                {song.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="volume-control">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
}

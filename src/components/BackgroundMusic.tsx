import { useState, useRef, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  genre: 'Lofi' | 'Phonk';
  url: string;
}

const SONGS: Song[] = [
  // Lofi Songs
  {
    id: 1,
    title: 'Chill Lofi Beat',
    genre: 'Lofi',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'
  },
  {
    id: 2,
    title: 'Study Session',
    genre: 'Lofi',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4bebedf545.mp3'
  },
  {
    id: 3,
    title: 'Relaxing Vibes',
    genre: 'Lofi',
    url: 'https://cdn.pixabay.com/audio/2023/02/28/audio_6e0401c15f.mp3'
  },
  // Phonk Songs
  {
    id: 4,
    title: 'Dark Phonk',
    genre: 'Phonk',
    url: 'https://cdn.pixabay.com/audio/2022/08/23/audio_2fbd08a8c8.mp3'
  },
  {
    id: 5,
    title: 'Night Drive',
    genre: 'Phonk',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_1bb9800e96.mp3'
  },
  {
    id: 6,
    title: 'Street Phonk',
    genre: 'Phonk',
    url: 'https://cdn.pixabay.com/audio/2023/01/11/audio_c8a891ef3d.mp3'
  }
];

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentSong, setCurrentSong] = useState<Song>(SONGS[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play();
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const selectSong = (song: Song) => {
    setCurrentSong(song);
    setIsExpanded(false);
  };

  const lofiSongs = SONGS.filter(s => s.genre === 'Lofi');
  const phonkSongs = SONGS.filter(s => s.genre === 'Phonk');

  return (
    <div className="music-controls">
      <audio
        ref={audioRef}
        loop
        src={currentSong.url}
      />

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

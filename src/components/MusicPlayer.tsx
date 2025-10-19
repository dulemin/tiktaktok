import { useState, useRef, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface Song {
  id: number;
  title: string;
  genre: 'Lofi' | 'Phonk';
  url: string;
}

export const SONGS: Song[] = [
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

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  currentSong: Song;
  isExpanded: boolean;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  selectSong: (song: Song) => void;
  setIsExpanded: (expanded: boolean) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
}

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
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

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const selectSong = (song: Song) => {
    setCurrentSong(song);
    setIsExpanded(false);
  };

  const contextValue: MusicContextType = {
    isPlaying,
    volume,
    currentSong,
    isExpanded,
    togglePlay,
    setVolume,
    selectSong,
    setIsExpanded,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {/* Audio element stays mounted always */}
      <audio
        ref={audioRef}
        loop
        src={currentSong.url}
        style={{ display: 'none' }}
      />
      {children}
    </MusicContext.Provider>
  );
}

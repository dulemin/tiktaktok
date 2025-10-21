import MusicControls from '../MusicControls';
import './SidebarSettingsSection.css';

interface SidebarSettingsSectionProps {
  gameSoundVolume: number;
  onGameSoundVolumeChange: (volume: number) => void;
}

export function SidebarSettingsSection({ gameSoundVolume, onGameSoundVolumeChange }: SidebarSettingsSectionProps) {
  return (
    <div className="sidebar-settings-section">
      <div className="sidebar-section-header">
        <span className="sidebar-section-icon">⚙️</span>
        <h3>Einstellungen</h3>
      </div>

      <div className="sidebar-settings-content">
        <div className="sidebar-setting-group">
          <h4 className="sidebar-setting-title">
            <span className="sidebar-setting-icon">🎵</span>
            Hintergrundmusik
          </h4>
          <div className="sidebar-music-controls">
            <MusicControls />
          </div>
        </div>

        <div className="sidebar-setting-group">
          <h4 className="sidebar-setting-title">
            <span className="sidebar-setting-icon">🔊</span>
            Spielzug Lautstärke
          </h4>
          <div className="sidebar-volume-control">
            <input
              type="range"
              min="0"
              max="100"
              value={gameSoundVolume}
              onChange={(e) => onGameSoundVolumeChange(Number(e.target.value))}
              className="sidebar-volume-slider"
            />
            <div className="sidebar-volume-value">{gameSoundVolume}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

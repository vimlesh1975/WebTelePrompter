'use client';

import { useState, useRef, useEffect } from 'react';
import { list_voices } from '../common'

const effectsProfiles = [
  { label: "None (Default)", value: "" },
  { label: "Headphones", value: "headphone-class-device" },
  { label: "Telephony / IVR", value: "telephony-class-application" },
  { label: "Mobile Phone", value: "handset-class-device" },
  { label: "Small Bluetooth Speaker", value: "small-bluetooth-speaker-class-device" },
  { label: "Medium Bluetooth Speaker", value: "medium-bluetooth-speaker-class-device" },
  { label: "TV / Home Entertainment", value: "large-home-entertainment-class-device" }
];

const pitchOptions = [
  { label: "Very Deep (-4)", value: -4 },
  { label: "Deep (-2)", value: -2 },
  { label: "Slightly Deep (-1) [Recommended]", value: -1 },
  { label: "Normal (0)", value: 0 },
  { label: "Slightly High (+1)", value: 1 },
  { label: "High (+2)", value: 2 },
  { label: "Very High (+4)", value: 4 }
];



export default function Home({ content }) {
  const [language, setLanguage] = useState('mr-IN');
  const [name, setName] = useState('mr-IN-Standard-A');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef(null);
  const languages = list_voices;
  const languagesLoading = false;

  const [profile, setProfile] = useState("headphone-class-device");
  const [pitch, setPitch] = useState(-1); // default for broadcast



  const handleSpeak = async () => {
    if (!content?.trim()) {
      return;
    }
    setLoading(true);
    setAudioUrl('');
    try {
      const response = await fetch('/api/speak', {
        // const response = await fetch('https://teleprompter-chi.vercel.app/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, languageCode: language, name, profile, pitch }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      alert('Failed to generate speech.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  return (
    <div style={{ padding: '10px' }}>

      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="language-select">Lang:</label>
        <select
          id="language-select"
          value={name}
          onChange={(e) => {
            const selectedVoice = languages.find((lang) => lang.name === e.target.value);
            setLanguage(selectedVoice.code);
            setName(selectedVoice.name);
            setAudioUrl('');
          }}
          style={{ marginLeft: 5 }}
        >
          {languagesLoading ? (
            <option>Loading languages...</option>
          ) : (
            languages.map((lang, index) => (
              <option key={index} value={lang.name}>
                {`${lang.name} (${lang.ssmlGender}, ${lang.code})`}
              </option>
            ))
          )}
        </select>


        <label>Playback Device</label>
        <select
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        >
          {effectsProfiles.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <label>Voice Pitch</label>

        <input
          type="range"
          min={-20}
          max={20}
          step={0.5}
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
        />


        {/* Auto Play Option */}
        <label htmlFor="autoPlay">
          <input
            type="checkbox"
            id="autoPlay"
            checked={autoPlay}
            onChange={() => setAutoPlay((val) => !val)}
          />
          Auto Play
        </label>

        {/* Speak Button */}
        <button onClick={handleSpeak} style={{ padding: '10px 20px' }} disabled={loading}>
          {loading ? 'Loading...' : 'Speak'}
        </button>
        Speed: {playbackSpeed.toFixed(1)}x
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          style={{ width: 100 }}
        />
      </div>
      {/* Audio Player and Controls */}
      {audioUrl && (
        <div style={{ marginTop: 5 }}>
          <audio style={{ width: 300, height: 30 }}
            controls
            src={audioUrl}
            autoPlay={autoPlay}
            ref={audioRef}
          ></audio>
        </div>
      )}
    </div>
  );
}

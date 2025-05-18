import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Slider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  CloudUpload,
} from '@mui/icons-material';
import axios from 'axios';

// Используем URL вашего Cloudflare Worker
const API_URL = 'https://musicquiz.your-username.workers.dev';

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  useEffect(() => {
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audio]);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/playlist`);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audio.duration);
  };

  const playTrack = async (track) => {
    try {
      const response = await axios.get(`${API_URL}/api/track/${track.path}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      audio.src = url;
      audio.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (event, newValue) => {
    audio.currentTime = newValue;
    setCurrentTime(newValue);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchPlaylist();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            WebDAV Music Player
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            disabled={uploading}
          >
            {uploading ? 'Загрузка...' : 'Загрузить трек'}
            <input
              type="file"
              hidden
              accept="audio/*"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            {currentTrack ? currentTrack.title : 'Нет выбранного трека'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => playTrack(playlist[0])}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={togglePlayPause}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={() => playTrack(playlist[playlist.length - 1])}>
              <SkipNext />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{formatTime(currentTime)}</Typography>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSliderChange}
              sx={{ flex: 1 }}
            />
            <Typography>{formatTime(duration)}</Typography>
          </Box>
        </Box>

        <List>
          {playlist.map((track) => (
            <ListItem
              key={track.id}
              button
              selected={currentTrack?.id === track.id}
              onClick={() => playTrack(track)}
            >
              <ListItemText
                primary={track.title}
                secondary={`Позиция: ${track.position}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default App; 
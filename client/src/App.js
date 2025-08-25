import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = "c354388e06164a5cb63be9603d34ec65";
const CLIENT_SECRET = "c37454d5c9b24d60abb9b11c1928c786";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]); 
  const [selectedTrack, setSelectedTrack] = useState(null); 

  useEffect(() => {
    const getToken = async () => {
      const authParameters = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
      };
      try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', authParameters);
        const tokenData = await tokenResponse.json();
        setAccessToken(tokenData.access_token);
      } catch (error) {
        console.error("Erro ao obter token:", error);
      }
    };
    getToken();
  }, []);

  const search = async () => {
    if (!searchInput) return;

    const searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };

    try {
     
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
        searchParameters
      );
      const artistData = await artistResponse.json();

      if (!artistData.artists.items.length) {
        alert("Artista não encontrado!");
        return;
      }

      const artistID = artistData.artists.items[0].id;

      
      const albumsResponse = await fetch(
        `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
        searchParameters
      );
      const albumsData = await albumsResponse.json();
      setAlbums(albumsData.items || []);

      
      const playlistsResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=playlist&limit=20`,
        searchParameters
      );
      const playlistsData = await playlistsResponse.json();
      setPlaylists(playlistsData.playlists?.items || []);

      
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=12`,
        searchParameters
      );
      const tracksData = await tracksResponse.json();
      setTracks(tracksData.tracks?.items || []);

    } catch (error) {
      console.error("Erro na busca:", error);
    }
  };

  return (
    <div className="App">
      <Container>
        <InputGroup className='mb-3' size='lg'>
          <FormControl
            placeholder='Pesquise por um artista, música ou estilo'
            type='input'
            onKeyPress={event => { if (event.key === "Enter") search(); }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>

     
      <Container>
        <h3>Músicas</h3>
        <Row className='mx-2 row row-cols-4'>
          {tracks.map((track, i) => (
            <Card 
              key={track?.id || i} 
              className="mb-3 track-card"
              onClick={() => setSelectedTrack(track)} 
              style={{ cursor: "pointer" }}
            >
              <Card.Img 
                src={track?.album?.images?.[0]?.url || "https://via.placeholder.com/300"} 
              />
              <Card.Body>
                <Card.Title>{track?.name}</Card.Title>
                <Card.Text>{track?.artists?.[0]?.name}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>

      
      <Container>
        <h3>Álbuns</h3>
        <Row className='mx-2 row row-cols-4'>
          {albums.map((album, i) => (
            <Card key={album?.id || i} className="mb-3 album-card">
              <Card.Img src={album?.images?.[0]?.url || "https://via.placeholder.com/300"} />
              <Card.Body>
                <Card.Title>{album?.name}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>

      
      <Container>
        <h3>Playlists</h3>
        <Row className='mx-2 row row-cols-4'>
          {playlists.map((playlist, i) => (
            <Card key={playlist?.id || i} className="mb-3 playlist-card">
              <Card.Img src={playlist?.images?.[0]?.url || "https://via.placeholder.com/300"} />
              <Card.Body>
                <Card.Title>{playlist?.name}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>

      
      <Modal show={!!selectedTrack} onHide={() => setSelectedTrack(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedTrack?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><b>Artista:</b> {selectedTrack?.artists?.map(a => a.name).join(", ")}</p>
          <p><b>Álbum:</b> {selectedTrack?.album?.name}</p>
          <p><b>Duração:</b> {(selectedTrack?.duration_ms / 60000).toFixed(2)} min</p>
          {selectedTrack?.preview_url && (
            <audio controls src={selectedTrack.preview_url}>
              Seu navegador não suporta o player de áudio.
            </audio>
          )}
          <br />
          <a 
            href={selectedTrack?.external_urls?.spotify} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Abrir no Spotify
          </a>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import './App.css'

//Container: To wrap around the search box
//InputGroup: Used as the form for our search box
//FormControl: For our search box input
//Button: For submitting input

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    //Requesting an access token that we can later use to retrieve data from the spotify API
    //Defining our object authParams
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    /*
      fetch() is a built-in JS function used to make HTTP requests.
      parameters:
        - the URL we're sending the POST request to (https://accounts.spotify.com/api/token)
        - the Options Object called authParams
      returns:
        - a Promise in which we're able to use our access token for our search function
    */

    /*
       .then() is used with Promises to handle actions that should happen after an asynchronous operation completes
       parameters:
         - first Callback function to execute on success (resolved Promise), the second (optional) to handle errors
       returns:
         - a new Promise
    */

    /*
      Flow of Execution:
      1. fetch() begins an HTTP request and returns a Promise
      2. first .then() executes once the response from fetch() arrives, converting the raw response into JSON
      3. Second .then runs with that JSON data, setting the access token for use in the app
      Each .then() waits for the previous asynchronous task to complete before executing, called Promise Chaining
    */
    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });

  }, [])

  const search = async () => {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    //Get artist 
    const artistId = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist", artistParams
    ).then((result) => result.json()).then((data) => {
      return data.artists.items[0].id;
    });

    console.log("Search Input: " + searchInput);
    console.log("Artist ID: " + artistId)

    //Get artists albums
    await fetch(
      "https://api.spotify.com/v1/artists/" + artistId + "/albums?include_groups=album&market=US&limit=50", artistParams
    ).then((result) => result.json()).then((data) => setAlbums(data.items));
  }

  return (
    <>
      <h1>Album Picker</h1>
      <Container>
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(e) => { search() ? e.key === "Enter" : setAlbums([])}} //Function here
            onChange={(e) => setSearchInput(e.target.value)} //Function here
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }} />
          <Button onClick={() => search()}>Search</Button>
        </InputGroup>
      </Container>
      <Container>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center"
          }}>
          {albums.map((album) => {
            return (
              <Card
                key={album.id}
                style={{
                  height: "375px",
                  backgroundColor: "white",
                  margin: "30px 10px",
                  borderRadius: "5px",
                  padding: "15px"
                }}
              >
                <Card.Img
                  width={200}
                  src={album.images[0].url}
                  style={{
                    borderRadius: "4%",
                  }}
                />
                <Card.Body>
                  <Card.Title
                    style={{
                      whiteSpace: "wrap",
                      fontWeight: "bold",
                      maxWidth: "200px",
                      fontSize: "18px",
                      marginTop: "10px",
                      color: "black",
                    }}
                  >
                    {album.name}
                  </Card.Title>
                  <Card.Text
                    style={{
                      color: "black",
                    }}
                  >
                    Release Date: <br /> {album.release_date}
                  </Card.Text>
                  <Button
                    href={album.external_urls.spotify}
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                      borderRadius: "5px",
                      padding: "10px",
                    }}
                  >
                    Album Link
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>
    </>

  )
}

export default App

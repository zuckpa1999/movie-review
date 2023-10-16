import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocaStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


const KEY = "d592c32c";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("tt0816692")
  const tempquery = "interstellar"
  
  const {movies, isLoading, error } = useMovies(query,handleCloseMovie)
  const [watched, setWatched] = useLocalStorageState([],"watched")

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id))
  }

  function handleCloseMovie(id) {
    setSelectedId(null)
  }

  function handleAddWatch(movie) {
    setWatched(watched => [...watched, movie]) 

    // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
  }


  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))

  }




  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* { isLoading? <Loader/>:<MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectedMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? <MovieDetails
            selectedId={selectedId}
            handleCloseMovie={handleCloseMovie}
            onAddWatched={handleAddWatch}
            watched={watched}
          /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          }
        </Box>
      </Main>
    </>
  );
}


function Loader() {
  return <p className="loader">Loading...</p>
}


function ErrorMessage({ message }) {
  return <p className="error">
    <span>no</span> {message || 'err'}
  </p>
}
function NavBar({ children }) {
  return <nav className="nav-bar">
    <Logo />
    {children}
  </nav>
}


function Logo() {
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>Movie Review</h1>
  </div>
}


function NumResults({ movies }) {
  return <p className="num-results">
    Found <strong> {movies.length}</strong> results
  </p>
}
function Search({ query, setQuery }) {

 const inpuEl = useRef(null)

 useKey('Enter',function(){
  if(document.activeElement === inpuEl.current) return 
  inpuEl.current.focus()
  setQuery("")
 })

  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inpuEl}

  />
}
function Box({ children }) {

  const [isOpen, setIsOpen] = useState(true);

  return <div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>
    {isOpen && children}
  </div>
}

function Movie({ movie, onSelectedMovie }) {
  return <li onClick={() => onSelectedMovie(movie.imdbID)} key={movie.imdbID}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
}
function MovieList({ movies, onSelectedMovie }) {
  return <ul className="list list-movies">
    {movies?.map((movie) => (
      <Movie movie={movie} key={movie.imdbID} onSelectedMovie={onSelectedMovie} />
    ))}
  </ul>
}


function MovieDetails({ selectedId, handleCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setuserRating] = useState('')

  const countRef = useRef(0)

  useEffect(function(){

    if(userRating) countRef.current = countRef.current + 1;
  },[userRating])
  const isWatched = watched.map(movie => movie.imdbID)
    .includes(selectedId)
  const watchedUserrating = watched.find(movie => movie.imdbID === selectedId)?.userRating
  const { Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie


  const isTop = imdbRating > 8
  console.log('isTop',isTop);
  const [avgRating,setAvgRating] = useState(0)

  function handleAdd() {

    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: runtime.split(' ').at(0),
      userRating,
      countRatingDecisions: countRef.current,
    }
    onAddWatched(newWatchedMovie)
    handleCloseMovie()
  }

 useKey('Escape',handleCloseMovie)


  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=d592c32c&i=${selectedId}`)
      const data = await res.json()
      setMovie(data)
      setIsLoading(false);
    }

    getMovieDetails()
  }, [selectedId])

  useEffect(function () {
    if (!title) return
    document.title = `Movie | ${title}`

    return function () {
      document.title = "usePopcorn"
    }
  }, [title])

  return <div className="details">
    {isLoading ? <Loader /> :
      <>
        <header>
          <button className="btn-back" onClick={handleCloseMovie}>
            &larr;
          </button>
          <img src={poster} alt={`Poster of ${movie}`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p><span>⭐️</span>{imdbRating}  iMDb rating</p>
          </div>
        </header>
        <section>
          <div className="rating">
            {!isWatched ?
              <>
                <StarRating maxRating={10} size={24} onSetRating={setuserRating} />

                {userRating > 0 && (<button className="btn-add" onClick={handleAdd}>
                  + Add to list
                </button>
                )} </> :
              <p>You rated with movie
                {watchedUserrating}  <span>⭐️</span> </p>}
          </div>

          <p><em>{plot}</em></p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>

        </section>

      </>
    }

  </div>
}

function WatchedSummary({ watched }) {

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return <div className="summary">
    <h2>Movies you watched</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{avgUserRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime} min</span>
      </p>
    </div>
  </div>
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return <li key={movie.imdbID}>
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.ritle}</h3>
    <div>
      <p>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{movie.userRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>

      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
        X
      </button>
    </div>
  </li>
}
function WatchedMoviesList({ watched, onDeleteWatched }) {
  return <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie movie={movie} key={movie.imdbID}
        onDeleteWatched={onDeleteWatched} />
    ))}
  </ul>
}

function Main({ children }) {

  return <main className="main">
    {children}
  </main>
}

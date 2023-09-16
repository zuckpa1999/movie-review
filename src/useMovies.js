import { useState,useEffect } from "react";

export function useMovies(query,callback){


    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(function () {

        callback?.()
        const controller = new AbortController()
        async function fetchMovies() {
          try {
            setIsLoading(true)
            setError("")
            const res = await fetch(`http://www.omdbapi.com/?apikey=d592c32c&s=${query}`,
              { signal: controller.signal })
    
    
            if (!res.ok) throw new Error('Somethjing went wrong with fetching movies')
            const data = await res.json()
            if (data.Response === 'False') throw new Error('Movie not found')
            setMovies(data.Search)
            setError("")
            //  setIsLoading(false)
          } catch (err) {
            if (err.name !== "AbortError") {
              setError(err.message)
            }
          } finally {
            setIsLoading(false)
          }
          // Hook
          //only run on mount/ first time
          // effect/si de effect => function, run after UIpaintedon the screen
          // stricmMode run effect twice in the development mode
        }
    
        if (query.length < 3) {
          setMovies([]);
          setError('')
          return;
        }
    
    
        fetchMovies();
    
    
        //cancel the current request when the new one comes in
        return function () {
          controller.abort();
        }
      }, [query]);
      return {movies, isLoading,error}
}
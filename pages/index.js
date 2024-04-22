
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
const API_URL = 'https://www.googleapis.com/books/v1/volumes';
const AUTOCOMPLETE_URL = 'https://www.googleapis.com/books/v1/volumes?q=';

const Index = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState('');
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false); 

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(API_URL, {
        params: {
          q: query + (genre ? ` subject:${genre}` : ''), // Include genre in search query if provided
          key: API_KEY,
        },
      });
      setBooks(response.data.items || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchAutocompleteOptions = async () => {
    try {
      const response = await axios.get(AUTOCOMPLETE_URL + query);
      setAutocompleteOptions(response.data.items || []);
    } catch (error) {
      console.error('Error fetching autocomplete options:', error);
    }
  };

  const handleBookSelection = (book) => {
    setSelectedBook(book);
    setIsSpeaking(false); 
  };

  const handleTextToSpeech = () => {
    if (selectedBook) {
      if (!isSpeaking) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = `${selectedBook.volumeInfo.title} by ${selectedBook.volumeInfo.authors.join(', ')}. ${selectedBook.volumeInfo.description || ''}`;
        window.speechSynthesis.speak(speech);
        setIsSpeaking(true);
      } else {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  useEffect(() => {
    if (query) {
      fetchAutocompleteOptions();
    } else {
      setAutocompleteOptions([]);
    }
  }, [query]);

  return (
    <div>
      <Head>
        <title>Reason to Read Book Search</title>
        <link rel="icon" href="/favicon.ico" />
     
      </Head>

      <main>
        <h1>Find a Book for Your Reason to Read</h1>
        <form onSubmit={handleSearch}>
          <input type="text" value={query} onChange={handleChange} placeholder="Enter a reason to read..." />
          <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Enter a genre" />
          <button type="submit">Search</button>
        </form>
        <h2>Genre Overview: {genre}</h2> 
        <ul>
          {books.map((book) => (
            <li key={book.id} onClick={() => handleBookSelection(book)}>
              <div className="book-card">
                <h3>{book.volumeInfo.title}</h3>
                <p>{book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author'}</p>
                <p>Publication Year: {book.volumeInfo.publishedDate || 'Unknown'}</p>
                <p>{book.volumeInfo.description || 'No description available'}</p>
                {book.volumeInfo.infoLink && (
                  <p><a href={book.volumeInfo.infoLink} target="_blank" rel="noopener noreferrer">Link to Book</a></p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <ul>
          {autocompleteOptions.map((option) => (
            <li key={option.id} onClick={() => handleBookSelection(option)}>
              <div className="book-card">
                <p>{option.volumeInfo.title}</p>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={handleTextToSpeech}>{isSpeaking ? 'Stop Reading' : 'Read Selected Book'}</button>
      </main>
    </div>
  );
};

export default Index;

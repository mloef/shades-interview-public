'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Switch } from '@mui/material';

const ListItem: React.FC<ListItemProps> = ({ title, summary, imageUrl }) => (
  <div className="flex mb-4 items-center">
    {imageUrl
      ? <Image src={imageUrl + '?h=150'} alt={title} height={100} width={100} />
      : null
    }

    <div className="ml-4">
      <h3 className="font-bold">{title}</h3>
      <p className="text-xs">{summary}</p>
    </div>
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ListItemProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<{ [id: string]: ListItemProps; }>({});

  useEffect(() => {
    const localFavorites = localStorage.getItem('favorites');
    if (localFavorites) {
      setFavorites(JSON.parse(localFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Define a function to handle the search query
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/searchPosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: event.target.value }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const results: ListItemProps[] = await response.json();

      setSearchResults(results);
    } catch (err) {
      setError('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (item: ListItemProps) => {
    const id = item._id;
    if (favorites.hasOwnProperty(id)) {
      const newFavorites = { ...favorites };
      delete newFavorites[id];
      setFavorites(newFavorites);
    } else {
      setFavorites((prevFavorites) => ({
        ...prevFavorites,
        [id]: item,
      }));
    }
  };

  return (
    <main className="flex h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full flex justify-between h-full">

        {/* Left side: Search and Search Results */}
        <div className="w-1/2 pr-4 h-full">
          <input
            type="text"
            placeholder="Search..."
            className="w-full mb-4 border-b p-2 text-gray-800"
            value={searchQuery}
            onChange={handleSearch} // Add onChange event listener
          />
          <div className="overflow-y-auto h-full rounded-lg p-4 scrollbar-thumb-gray-500 scrollbar-track-gray-200 hover:overflow-y-auto flex">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {searchResults.length > 0 ? (
              <div className="flex flex-col">
                {searchResults.map((item, index) => (
                  <div key={index} className="p-0">
                    <div key={index} className="flex justify-between items-center">
                      <ListItem {...item} />
                      <Switch
                        checked={favorites.hasOwnProperty(item._id)}
                        onChange={() => { toggleFavorite(item); }}
                        color="primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>No results found</div>
            )}
          </div>
        </div>

        {/* Right side: My Likes */}
        <div className="w-1/2 pl-4">
          <h1 className="font-mono text-sm mb-4 p-2">My Likes</h1>
          <div className="overflow-y-auto h-full rounded-lg p-4 scrollbar-thumb-gray-500 scrollbar-track-gray-200 hover:overflow-y-auto flex">
            <div className="flex flex-col">

              {Object.entries(favorites).map(([id, item], index) => (
                <div key={index} className="flex justify-between items-center">
                  <ListItem {...item} />
                </div>
              ))}

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

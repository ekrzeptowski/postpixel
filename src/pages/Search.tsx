import { useState, useEffect } from "react";
import { Link } from "react-router";

import { supabase } from "../utils/supabase";
import { Input } from "../components/Input";
import { Spinner } from "../components/Spinner";
import { getPhotoUrl } from "../utils/photos";

import styles from "./Search.module.scss";

type SearchResult = {
  type: "user" | "album";
  id: string;
  name: string;
  user_id?: string;
  photoCount?: number;
  albumCount?: number;
  previewPhotos: { url: string }[];
};

const ITEMS_PER_PAGE = 10;

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Because there is an infinite loading it was a good approach to use state instead of search params
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(0);
    setResults([]);
    setHasMore(true);
    if (query.trim().length > 0) {
      setLoading(true);
    }
  }, [query]);

  useEffect(() => {
    const searchData = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const from = page * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const [usersResponse, albumsResponse] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              `
          id, 
          display_name,
          photos(path),
          photo_count: photos(count),
          albums(count)
        `,
              { count: "exact" }
            )
            .ilike("display_name", `%${query}%`)
            .limit(3, {
              referencedTable: "photos",
            })
            .range(from, to),
          supabase
            .from("albums")
            .select(
              `
          id, 
          name, 
          user_id,
          photos(path),
          photo_count: photos(count)
        `,
              { count: "exact" }
            )
            .ilike("name", `%${query}%`)
            .limit(3, {
              referencedTable: "photos",
            })
            .range(from, to),
        ]);

        if (usersResponse.error) throw usersResponse.error;
        if (albumsResponse.error) throw albumsResponse.error;

        const userResults: SearchResult[] = (usersResponse.data || []).map(
          (user) => ({
            type: "user",
            id: user.id,
            name: user.display_name,
            photoCount: user.photo_count?.[0]?.count ?? 0,
            albumCount: user.albums?.[0]?.count ?? 0,
            previewPhotos: (user.photos || [])
              .filter((p) => p.path)
              .map((p) => ({ url: getPhotoUrl(user.id, p.path) })),
          })
        );

        const albumResults: SearchResult[] = (albumsResponse.data || []).map(
          (album) => ({
            type: "album",
            id: album.id,
            name: album.name,
            user_id: album.user_id,
            photoCount: album.photo_count?.[0]?.count ?? 0,
            previewPhotos: (album.photos || [])
              .filter((p) => p.path)
              .map((p) => ({ url: getPhotoUrl(album.user_id!, p.path) })),
          })
        );

        const newResults = [...userResults, ...albumResults];
        setResults((prev) =>
          page === 0 ? newResults : [...prev, ...newResults]
        );

        const totalCount =
          (usersResponse.count || 0) + (albumsResponse.count || 0);
        setHasMore(from + newResults.length < totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchData, 500);
    return () => clearTimeout(timeoutId);
  }, [query, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className={styles.searchContainer}>
      <h1>Search</h1>

      <div className={styles.searchBox}>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users or albums..."
          autoFocus
        />
      </div>

      {loading && page === 0 && <Spinner className={styles.spinner} />}

      {error && <p className={styles.error}>{error}</p>}

      {results.length > 0 ? (
        <>
          <div className={styles.results}>
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                to={
                  result.type === "user"
                    ? `/profile/${result.id}`
                    : `/?album=${result.id}`
                }
                className={styles.resultItem}
              >
                <span className={styles.icon}>
                  {result.type === "user" ? "👤" : "📁"}
                </span>
                <div className={styles.resultInfo}>
                  <span className={styles.name}>{result.name}</span>
                  <span className={styles.type}>
                    {result.type === "user"
                      ? `User • ${result.photoCount} photo${
                          (result.photoCount ?? 0) === 1 ? "" : "s"
                        } • ${result.albumCount} albums`
                      : `Album • ${result.photoCount} photo${
                          (result.photoCount ?? 0) === 1 ? "" : "s"
                        }`}
                  </span>
                  {result.previewPhotos.length > 0 && (
                    <div className={styles.previewPhotos}>
                      {result.previewPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo.url}
                          alt=""
                          className={styles.previewPhoto}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {hasMore && (
            <button
              className={styles.loadMoreButton}
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Load More"}
            </button>
          )}
        </>
      ) : query && !loading ? (
        <p className={styles.noResults}>No results found</p>
      ) : null}
    </div>
  );
};

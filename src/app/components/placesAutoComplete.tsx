import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import axios from "axios";
import { cn } from "./ui/utils";

type Place = Record<string, any>;

interface PlacesAutocompleteProps {
  onSelect?: (place: Place) => void;
}

export default function PlacesAutocomplete({
  onSelect,
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelected(null);

    if (!query || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    // debounce
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      search(query.trim());
    }, 60);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [query]);

  async function search(q: string) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Missing Google Maps API key");
      return;
    }
    if (selected) return;

    setLoading(true);
    setError(null);
    try {
      const body = { textQuery: q };
      const resp = await axios.post(
        "https://places.googleapis.com/v1/places:searchText",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            // Request only valid fields. Include `places.types` so we can
            // filter results to restaurants and bars client-side.
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.priceLevel,places.types",
          },
        },
      );

      // API returns `places` array; fall back to `results` if present
      const places: Place[] = resp.data?.places ?? resp.data?.results ?? [];

      // Filter to restaurants and bars only
      const filtered = (places || []).filter((p: Place) => {
        const types = getTypesFromPlace(p);
        if (!types || types.length === 0) return false;
        return types.includes("restaurant") || types.includes("bar");
      });

      setResults(filtered);
    } catch (err) {
      console.error(
        "Places search error",
        err?.response?.data ?? err.message ?? err,
      );
      setError("Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(place: Place) {
    // pass the selected place to parent
    if (onSelect) onSelect(place);
    // set input to chosen display name or formatted address (coerce objects)
    const label = getLabelFromPlace(place);
    setQuery(label);
    setSelected(place);
    setResults([]);
  }

  function stringifyField(field: any): string {
    if (field == null) return "";
    if (typeof field === "string") return field;
    if (typeof field === "number") return String(field);
    // If the API returns a localized object like { text, languageCode }
    if (typeof field === "object") {
      if (field.text) return field.text;
      // If it's an array of localized values, try first element
      if (Array.isArray(field) && field.length > 0) {
        const first = field[0];
        if (typeof first === "string") return first;
        if (first && first.text) return first.text;
      }
      // Fallback to JSON string (rare)
      try {
        return JSON.stringify(field);
      } catch (e) {
        return "";
      }
    }
    return String(field);
  }

  function getLabelFromPlace(p: Place): string {
    return (
      stringifyField(p?.places?.[0]?.displayName) ||
      stringifyField(p?.displayName) ||
      stringifyField(p?.formattedAddress) ||
      ""
    );
  }

  function getSubFromPlace(p: Place): string | null {
    return (
      stringifyField(p?.places?.[0]?.formattedAddress) ||
      stringifyField(p?.formattedAddress) ||
      null
    );
  }

  function getTypesFromPlace(p: Place): string[] {
    // Try multiple locations where types might appear
    const t1 = p?.places?.[0]?.types ?? p?.types ?? p?.place?.types ?? null;
    if (!t1) return [];
    if (Array.isArray(t1))
      return t1
        .map((v: any) => (typeof v === "string" ? v : stringifyField(v)))
        .filter(Boolean) as string[];
    if (typeof t1 === "string") return [t1];
    // fallback: coerce object to string list if possible
    try {
      return [String(t1)];
    } catch (e) {
      return [];
    }
  }

  return (
    <div ref={containerRef}>
      <input
        type="search"
        placeholder="Search restaurants..."
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        )}
      />

      {loading && (
        <div style={{ position: "absolute", right: 10, top: 10 }}>…</div>
      )}

      {error && <div style={{ color: "#b00020", marginTop: 6 }}>{error}</div>}

      {results && results.length > 0 && (
        <ul
          role="listbox"
          className={cn(
            "z-40 mt-2 max-h-80 overflow-y-auto rounded-md border bg-popover shadow-md py-1",
            "divide-y divide-border",
          )}
          style={{
            // set the dropdown width to match the input's rendered width
            width:
              containerRef.current
                ?.querySelector("input")
                ?.getBoundingClientRect().width ?? undefined,
            boxSizing: "border-box",
            left: 0,
          }}
        >
          {results.map((p: Place, i: number) => {
            const label = getLabelFromPlace(p) || "(unknown)";
            const sub = getSubFromPlace(p);
            const key = p.placeId ?? p.place_id ?? `${i}`;
            return (
              <li
                key={key}
                role="option"
                tabIndex={0}
                onClick={() => handleSelect(p)}
                onKeyDown={(e: React.KeyboardEvent<HTMLLIElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(p);
                  }
                }}
                className={cn(
                  "px-3 py-2 cursor-pointer flex flex-col gap-1",
                  "hover:bg-accent/60 focus:bg-accent/60 focus:outline-none",
                  "last:rounded-b-md",
                )}
              >
                <div className={cn("font-medium text-sm")}>{label}</div>
                {sub && (
                  <div className={cn("text-xs text-muted-foreground")}>
                    {sub}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

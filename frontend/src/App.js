import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePassiveEventListeners } from "./usePassiveEventListeners";
import "./App.css";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import { arrayMoveImmutable } from "array-move";

// cat images from https://cataas.com
const thumbnails = {
  "bank-draft": "https://cataas.com/cat/NWO1DbHLf2RgndBg?position=center",
  "bill-of-lading": "https://cataas.com/cat/P8EJ6pT54XZPkEyN?position=center",
  invoice: "https://cataas.com/cat/fbOOCGH1iXI1I4Hs?position=center",
  "bank-draft-2": "https://cataas.com/cat/oNkBkVy9LVTuELR3?position=center",
  "bill-of-lading-2": "https://cataas.com/cat/EAkzcimxVLTHeclg?position=center",
};

const SortableItem = SortableElement(({ value, onClick }) => {
  return (
    <div className="card" onClick={() => onClick(value.type)}>
      <img src={thumbnails[value.type]} alt={value.title} />
      <h3>{value.title}</h3>
    </div>
  );
});

const SortableList = SortableContainer(({ items, onClick }) => {
  if (!items.length) return <> No items </>;
  return (
    <div className="card-container">
      {items?.map((value, index) => (
        <SortableItem
          key={`item-${value.position}`}
          index={index}
          value={value}
          onClick={onClick}
        />
      ))}
    </div>
  );
});

const saveDocuments = async (apiUrl, items) => {
  try {
    const response = await fetch(`${apiUrl}/documents/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });
    if (!response.ok) {
      throw new Error("Failed to save data");
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overlayImage, setOverlayImage] = useState(null);
  //We can also use a proxy to access the backend instead of an environment variable depending on preference
  const apiUrl =
    process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";
  usePassiveEventListeners();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/documents`);
        const data = await response.json();

        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOverlayImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => saveDocuments(apiUrl, items), 5000);
    // save data every 5 seconds
    return () => clearInterval(intervalId);
  }, [items]);

  const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
    setItems((prevItems) =>
      arrayMoveImmutable(prevItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        position: index,
      }))
    );
  }, []);
  
  const handleCardClick = useCallback(
    (type) => setOverlayImage(thumbnails[type]),
    []
  );

  const memoizedItems = useMemo(() => items, [items]);

  if (loading) return <div>No items</div>;

  return (
    <div>
      <SortableList
        items={memoizedItems}
        onSortEnd={onSortEnd}
        distance={1}
        axis="xy"
        onClick={handleCardClick}
      />
      {overlayImage && (
        <div className="overlay" onClick={() => setOverlayImage(null)}>
          <img src={overlayImage} alt="Overlay" className="overlay-image" />
        </div>
      )}
    </div>
  );
}

export default App;

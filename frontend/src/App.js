import React, { useEffect, useState } from "react";
import { usePassiveEventListeners } from "./usePassiveEventListeners";
import "./App.css";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import { arrayMoveImmutable } from "array-move";

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
  return (
    <div className="card-container">
      {items.map((value, index) => (
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

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overlayImage, setOverlayImage] = useState(null);
  usePassiveEventListeners();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/documents");
        const data = await response.json();
        console.log("Data fetched:", data);
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();

    // const intervalId = setInterval(fetchData, 5000);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOverlayImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // clearInterval(intervalId);
    };
  }, []);

  const saveData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/documents/bulk", {
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
  useEffect(() => {
    const intervalId = setInterval(saveData, 5000);

    return () => clearInterval(intervalId);
  }, [items]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newItems = arrayMoveImmutable(items, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        position: index,
      })
    );
    setItems(newItems);
    // saveData(newItems);
  };

  const handleCardClick = (type) => {
    setOverlayImage(thumbnails[type]);
  };
  if (loading) {
    return <div>No items</div>;
  }

  return (
    <div>
      <SortableList
        items={items}
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

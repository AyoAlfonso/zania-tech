import React, { useEffect, useState } from "react";
import { usePassiveEventListeners } from "./usePassiveEventListeners";
import "./App.css";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import { arrayMoveImmutable } from "array-move";

const data = [
  { type: "bank-draft", title: "Bank Draft", position: 0 },
  { type: "bill-of-lading", title: "Bill of Lading", position: 1 },
  { type: "invoice", title: "Invoice", position: 2 },
  { type: "bank-draft-2", title: "Bank Draft 2", position: 3 },
  { type: "bill-of-lading-2", title: "Bill of Lading 2", position: 4 },
];

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
    //replace with async call
    setTimeout(() => {
      setItems(data);
      setLoading(false);
    }, 0.01);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOverlayImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMoveImmutable(items, oldIndex, newIndex));
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

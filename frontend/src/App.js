import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { usePassiveEventListeners } from "./usePassiveEventListeners";
import "./App.css";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import _ from "lodash"; // Import lodash

import { arrayMoveImmutable } from "array-move";
import { Oval } from "react-loader-spinner";

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
  const [saving, setSaving] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [timeSinceLastSave, setTimeSinceLastSave] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const lastItemsRef = useRef(_.cloneDeep(items)); // Ref to store last items state

  //We can also use a proxy to access the backend instead of an environment variable depending on preference
  const apiUrl =
    process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";
  usePassiveEventListeners();

  // Fetch data from the backend on app mount
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

  // Handle key down event to close overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOverlayImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save items state every 5 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (!_.isEqual(items, lastItemsRef.current)) {
        setSaving(true);
        saveDocuments(apiUrl, items).then(() => {
          setLastSaveTime(Date.now());
          console.log("Saved successfully");
          setSaving(false);
          lastItemsRef.current = _.cloneDeep(items);
        });
      }
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [items]);

  // Update time since last save every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceLastSave(Math.floor((Date.now() - lastSaveTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSaveTime]);

  // Update items state when the sortable list changes
  const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
    setItems((prevItems) =>
      arrayMoveImmutable(prevItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        position: index,
      }))
    );
  }, []);

  // Handle click on a card to open the overlay
  const handleCardClick = useCallback(
    (type) => setOverlayImage(thumbnails[type]),
    []
  );

  // Memoize items state to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items]);

  // Display a loading spinner while data is being fetched
  if (loading)
    return <Oval visible={true} ariaLabel="loading" width={50} height={50} />;

  return (
    <div>
      <span>
        {saving && (
          <Oval visible={true} ariaLabel="loading" width={50} height={50} />
        )}
        <div>Last saved: {timeSinceLastSave} seconds ago</div>
      </span>
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

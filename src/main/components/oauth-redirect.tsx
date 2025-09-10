import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <>
      <p>Authentication successful! Please return to hypertension.</p>
    </>
  );
};

// Render your React component instead
const root = createRoot(document.getElementById("app"));
root.render(<App />);

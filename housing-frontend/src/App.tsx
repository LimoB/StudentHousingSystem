import AppRoutes from "./routes/AppRoutes";
import "./index.css"; // Tailwind styles

const App: React.FC = () => {
  return <AppRoutes />; // no <BrowserRouter> here
};

export default App;
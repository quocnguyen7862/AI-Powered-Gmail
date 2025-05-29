import './App.css';
import './input.css';
import ReplyQuickPopup from './components/ReplyQuickPopup';
import SummaryPopup from './components/SummaryPopup';
import AppMenuPopup from './components/AppMenuPopup';
import SelectLabels from './components/SelectLabels';

function App() {
  return (
    <>
      {/* <ReplyQuickPopup />
      <SummaryPopup /> */}
      <AppMenuPopup />
      <SelectLabels />
    </>
  );
}

export default App;

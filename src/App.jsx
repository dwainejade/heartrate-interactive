import Biker from "./components/Biker";
import Runner from "./components/Runner";
import './App.css'

export default function App() {

  return (
    <div className="App">
      <Runner />
      <Biker />

      {/* <div>
        <label htmlFor="heartRateInput">Heart Rate: </label>
        <input
          id="heartRateInput"
          type="number"
          min="30"
          max="200"
          value={heartRate}
          onChange={handleHeartRateChange}
        />
      </div> */}
    </div>
  );
}

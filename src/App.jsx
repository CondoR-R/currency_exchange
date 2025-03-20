import { useState, useEffect } from "react";
import "./index.css";

const API_URL = "https://api.frankfurter.dev/v1";

function App() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function getCurrencies() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/latest`);
        const data = await res.json();
        if (data?.message) {
          throw new Error(data.message);
        }
        setCurrencies(Object.keys(data.rates));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getCurrencies();
  }, []);

  const changeToCurrency = (e) => setToCurrency(e.target.value);
  const changeFromCurrency = (e) => setFromCurrency(e.target.value);
  const handleChangeAmount = (e) => setAmount(e.target.value);

  const handleConvert = async () => {
    setIsConverting(true);
    setResult(null);
    setError(null);

    try {
      if (!amount) {
        throw new Error("Amount must be filled in");
      } else if (+amount < 0) {
        throw new Error("Amount must be positive");
      }

      const res = await fetch(
        `${API_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );
      const data = await res.json();

      if (data?.message) {
        throw new Error(data.message);
      }

      setResult(
        `${amount} ${fromCurrency} → ${
          Object.values(data.rates)[0]
        } ${toCurrency}`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const renderSelect = (changeCurrency, currentCurrency) => (
    <select
      onChange={changeCurrency}
      value={currentCurrency}
      className="dropdown"
    >
      {currencies.map((currency, index) => (
        <option key={index} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  );

  return (
    <div className="app">
      <h1>Калькулятор обмена валют</h1>

      <div className="converter-container">
        <p className="error">{error}</p>

        <div className="input-group">
          <input
            value={amount}
            onChange={handleChangeAmount}
            type="number"
            placeholder="Amount"
            className="input-field"
          />
          {renderSelect(changeFromCurrency, fromCurrency)}
          <span className="arrow">→</span>
          {renderSelect(changeToCurrency, toCurrency)}
        </div>
        <button onClick={handleConvert} className="convert-button">
          Конвертировать
        </button>
        <p className="loading">
          {isLoading && <p>Loading...</p>}
          {isConverting && <p>Converting...</p>}
        </p>
        <p className="result">{!isConverting && result}</p>
      </div>
    </div>
  );
}

export default App;

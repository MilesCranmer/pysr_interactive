import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

const IndexPage: React.FC = () => {
  const availableOperators = ["+", "-", "*", "/", "^"];
  const availableUnaryOperators = ["sin", "cos", "exp", "log", "square", "cube", "sqrt", "abs", "tan", "tanh"];

  const [model, setModel] = useState('best');
  const [operators, setOperators] = useState(["+", "-", "*", "/"]);
  const [unaryOperators, setUnaryOperators] = useState([]);
  const [iterations, setIterations] = useState(40);
  const [output, setOutput] = useState("");

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const operator = e.target.value;
    if (e.target.checked) {
      setOperators([...operators, operator]);
    } else {
      setOperators(operators.filter((o) => o !== operator));
    }
  };

  const handleUnaryOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const operator = e.target.value;
    if (e.target.checked) {
      setUnaryOperators([...unaryOperators, operator]);
    } else {
      setUnaryOperators(unaryOperators.filter((o) => o !== operator));
    }
  };

  const handleIterationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIterations(parseInt(e.target.value));
  };


  // Define display:
  useEffect(() => {
    // const output = `Model: ${model}\nOperators: ${operators.join(", ")}\nIterations: ${iterations}`;
    // Example output:
    //   model = PySRRegressor(
    //     niterations=40,  # < Increase me for better results
    //     binary_operators=["+", "*"],
    //     unary_operators=[
    //         "cos",
    //         "exp",
    //         "sin",
    //         "inv(x) = 1/x",
    //         # ^ Custom operator (julia syntax)
    //     ],
    //     extra_sympy_mappings={"inv": lambda x: 1 / x},
    //     # ^ Define operator for SymPy as well
    //     loss="loss(x, y) = (x - y)^2",
    //     # ^ Custom loss function (julia syntax)
    // )
    const output = `model = PySRRegressor(
    model_selection=${model},
    niterations=${iterations},
    binary_operators=${JSON.stringify(operators)},
    unary_operators=${JSON.stringify(unaryOperators)},
)`;
    setOutput(output);
  }, [model, operators, iterations]);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <form>
        <div className="form-group">
          <br />
          <label className="h5">Model Selection</label>
          <select
            className="form-control"
            value={model}
            onChange={handleModelChange}
          >
            <option value="accuracy">Accuracy</option>
            <option value="best" selected>Best</option>
            <option value="score">Score</option>
          </select>
        </div>
        <br />
        <div className="form-group">
          {/* <label >Binary Operators</label> */}
          {/* Same, but with className that makes it bold and larger: */}
          <label className="h5">Binary Operators</label>
          <div className="form-row">
            {availableOperators.map((operator) => (
              <div className="form-group col-4" key={operator}>
                <div className="form-check">
                  <input
                    type="checkbox"
                    value={operator}
                    onChange={handleOperatorChange}
                    checked={operators.includes(operator)}
                    className="form-check-input"
                  />
                  <label className="form-check-label">{operator}</label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          {/* Same for unary operators: */}
          <label className="h5">Unary Operators</label>
          <div className="form-row">
            {availableUnaryOperators.map((operator) => (
              <div className="form-group col-4" key={operator}>
                <div className="form-check">
                  <input
                    type="checkbox"
                    value={operator}
                    onChange={handleUnaryOperatorChange}
                    checked={unaryOperators.includes(operator)}
                    className="form-check-input"
                  />
                  <label className="form-check-label">{operator}</label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <br />
        <div className="form-group">
          <label className="h5">Number of Iterations</label>
          <br />
          <input
            type="range"
            min={1}
            max={1000}
            step={1}
            value={iterations}
            onChange={handleIterationsChange}
          />
          <input
            type="number"
            min={1}
            max={1000}
            value={iterations}
            onChange={handleIterationsChange}
          />
        </div>
        <br />
        <div>
          <button onClick={(event) => {
            event.preventDefault();
            navigator.clipboard.writeText(output);
          }}>Copy Output</button>
          <pre>{output}</pre>
        </div>
      </form>
    </div>
  );
};

export default IndexPage;
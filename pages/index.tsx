import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Prism from 'prismjs';
import "bootstrap/dist/css/bootstrap.min.css";
import "prismjs/themes/prism-coy.min.css";
import "prismjs/components/prism-python.js";


const IndexPage: React.FC = () => {
  const availableOperators = ["+", "-", "*", "/", "^"];
  const availableUnaryOperators = ["sin", "cos", "exp", "log", "square", "cube", "sqrt", "abs", "tan", "tanh"];
  const availableLosses = ["L2DistLoss()", "L1DistLoss()"];

  // Operators:
  const [operators, setOperators] = useState(["+", "-", "*", "/"]);
  const [unaryOperators, setUnaryOperators] = useState(["cos"]);

  // Iterations between 1 and 1000:
  const [iterations, setIterations] = useState(Math.log10(40) * 1000);

  // Complexity between 10 and 50:
  const [complexity, setComplexity] = useState(20);

  // Losses (just one at a time)
  const [loss, setLoss] = useState("L2DistLoss()");

  // ncyclesperiteration, between 10 and 10,000:
  // Actual value stored is log10(true_value) * 1000
  const [ncyclesperiteration, setNcyclesperiteration] = useState(Math.log10(550) * 1000);

  // Output:
  const [output, setOutput] = useState("");

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
    setIterations(parseFloat(e.target.value));
  };

  const handleLossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoss(e.target.value);
  };

  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComplexity(parseInt(e.target.value));
  };

  const handleNcyclesperiterationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNcyclesperiteration(parseFloat(e.target.value));
  };

  useEffect(() => {
    Prism.highlightElement(document.querySelector("#code-block"));
  }, [output]);


  // Define display:
  useEffect(() => {
    // Define output:
    const output = `model = PySRRegressor(
    niterations=${Math.round(10 ** (iterations / 1000))},
    ncyclesperiteration=${Math.round(10 ** (ncyclesperiteration / 1000))},
    binary_operators=${JSON.stringify(operators).replace(/,/g, ", ")},
    unary_operators=${JSON.stringify(unaryOperators).replace(/,/g, ", ")},
    loss="${loss}",
    maxsize=${complexity},
)`;
    setOutput(output);

  }, [operators, unaryOperators, iterations, ncyclesperiteration, loss, complexity]);


  return (
    <div>
      <div className="d-flex justify-content-center align-items-center">
        <Form>
          <br />
          {/* Operators: */}
          <Form.Group>
            <Form.Label><u>Binary Operators</u></Form.Label>
            <Container>
              <Row key={`row-bin-ops`}>
                {availableOperators.map((operator) => (
                  <Col xs={3} key={`col-operator-${operator}`}>
                    <Form.Check type="checkbox" id={`id-operator-${operator}`}>
                      <Form.Check.Label style={{ fontFamily: 'monospace' }}>{operator}</Form.Check.Label>
                      <Form.Check.Input type="checkbox" value={operator} onChange={handleOperatorChange} checked={operators.includes(operator)} />
                    </Form.Check>
                  </Col>
                ))}
              </Row>
            </Container>
          </Form.Group>
          <br />
          <Form.Group>
            <Form.Label><u>Unary Operators</u></Form.Label>
            <Container>
              <Row key={`row-una-ops`}>
                {availableUnaryOperators.map((operator) => (
                  <Col xs={3} key={`col-operator-${operator}`}>
                    <Form.Check type="checkbox" id={`operator-${operator}`}>
                      <Form.Check.Label style={{ fontFamily: 'monospace' }}>{operator}</Form.Check.Label>
                      <Form.Check.Input type="checkbox" value={operator} onChange={handleUnaryOperatorChange} checked={unaryOperators.includes(operator)} />
                    </Form.Check>
                  </Col>
                ))}
              </Row></Container>
          </Form.Group>
          <br />
          {/* Iterations: */}
          <Form.Group>
            <Form.Label><u>Number of Iterations</u></Form.Label>
            <Form.Range
              min={0}
              max={4000}
              step={1}
              value={iterations}
              onChange={handleIterationsChange}
            />
            <output className="d-flex justify-content-center">{Math.round(10 ** (iterations / 1000))}</output>
          </Form.Group>
          <br />
          {/* Losses: */}
          <Form.Group>
            <Form.Label><u>Loss</u></Form.Label>
            <Container>
              <Row key={`row-losses`}>
                {availableLosses.map((closs) => (
                  <Col xs={6} key={`col-loss-${closs}`}>
                    <Form.Check type="radio" id={`loss-${closs}`}>
                      <Form.Check.Label style={{ fontFamily: 'monospace' }}>{closs}</Form.Check.Label>
                      <Form.Check.Input type="radio" value={closs} onChange={handleLossChange} checked={loss === closs} />
                    </Form.Check>
                  </Col>
                ))}
              </Row>
            </Container>
          </Form.Group>
          <br />
          {/* Complexities */}
          <Form.Group>
            <Form.Label><u>Max Size</u></Form.Label>
            <Form.Range
              min={10}
              max={50}
              step={1}
              value={complexity}
              onChange={handleComplexityChange}
            />
            <output className="d-flex justify-content-center">{complexity}</output>
          </Form.Group>
          <br />
          {/* ncyclesperiteration */}
          <Form.Group>
            <Form.Label><u>Number of Cycles per Iteration</u></Form.Label>
            <Form.Range
              min={1000}
              max={4000}
              value={ncyclesperiteration}
              onChange={handleNcyclesperiterationChange}
            />
            <output className="d-flex justify-content-center">{Math.round(10 ** (ncyclesperiteration / 1000))}</output>
          </Form.Group>
          <br />
        </Form >
      </div >
      <div className="d-flex justify-content-center align-items-center">
        <Card>
          <Card.Body>
            <pre>
              <code className="language-python" id="code-block">{output}</code>
            </pre>
            {/* Line separating button: */}
            <hr />
            <Button onClick={(event) => {
              event.preventDefault();
              navigator.clipboard.writeText(output);
            }}>Copy Definition</Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default IndexPage;
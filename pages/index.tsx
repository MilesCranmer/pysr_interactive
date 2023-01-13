import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
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
    //Stringify with spaces between elements:
    const output = `model = PySRRegressor(
    model_selection="${model}",
    niterations=${iterations},
    binary_operators=${JSON.stringify(operators).replace(/,/g, ", ")},
    unary_operators=${JSON.stringify(unaryOperators).replace(/,/g, ", ")},
)`;
    setOutput(output);
  }, [model, operators, unaryOperators, iterations]);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <Form>
        <Form.Group>
          <br />
          <Form.Label>Model Selection</Form.Label>
          <Form.Select className="form-control" value={model} onChange={handleModelChange}>
            <option value="accuracy">Accuracy</option>
            <option value="best" selected>Best</option>
            <option value="score">Score</option>
          </Form.Select>
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Binary Operators</Form.Label>
          <Container>
            <Row>
              {availableOperators.map((operator) => (
                <Col xs={3}>
                  <Form.Check type="checkbox" label={operator} value={operator} onChange={handleOperatorChange} checked={operators.includes(operator)} />
                </Col>
              ))}
            </Row>
          </Container>
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Unary Operators</Form.Label>
          <Container>
            <Row>
              {availableUnaryOperators.map((operator) => (
                <Col xs={3}>
                  <Form.Check type="checkbox" label={operator} value={operator} onChange={handleUnaryOperatorChange} checked={unaryOperators.includes(operator)} />
                </Col>
              ))}
            </Row></Container>
        </Form.Group>
        <br />
        <Form.Group>
          <Form.Label>Number of Iterations</Form.Label>
          <Form.Range
            min={1}
            max={1000}
            step={1}
            value={iterations}
            onChange={handleIterationsChange}
          />
          <output className="d-flex justify-content-center">{iterations}</output>
        </Form.Group>
        <br />
        <Card>
          <Card.Body>
              <pre>
                <code className="language-python">
                  {output}
                </code>
              </pre>
              {/* Line separating button: */}
              <hr />
              <Button onClick={(event) => {
              event.preventDefault();
              navigator.clipboard.writeText(output);
            }}>Copy Output</Button>
          </Card.Body>
        </Card>
      </Form >
    </div >
  );
};

export default IndexPage;
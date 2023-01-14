import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Prism from 'prismjs';
import "bootstrap/dist/css/bootstrap.min.css";
import "prismjs/themes/prism-coy.min.css";
import "prismjs/components/prism-python.js";

// Let's create a type to hold each of these parameters, along with
//  a specification of their type, and how they should be displayed, as in
//  with a range, with a choice, with multiple choice, with a boolean, etc.

type Parameter = {
  name: string; // The name of the parameter
  type: string; // The Python type of the parameter
  description: string; // A description of the parameter
  default?: any; // The default value of the parameter
  full_name?: string; // The full name of the parameter, if it is a nested parameter
  choices?: any[]; // If the parameter has a choice, this is the list of choices
  range?: [number, number]; // If the parameter has a range, this is the range
  log?: boolean; // If the range is logarithmic, this is true
  boolean?: boolean; // If the parameter is a boolean, this is true
  selectable?: boolean; // If the parameter is selectable, this is true. Make default=0 for null state.
}

// Now we can create a list of parameters, with their types, descriptions, etc.
//  We will leave the descriptions blank for now, and pull them later from the Python code.
const _parameters: Parameter[] = [
  { name: "model_selection", type: "str", description: "", default: "best", choices: ["best", "accuracy", "score"] },
  { name: "binary_operators", type: "list[str]", description: "", default: ["+", "-", "*", "/"], choices: ["+", "-", "*", "/", "^"] },
  { name: "unary_operators", type: "list[str]", description: "", default: [], choices: ["sin", "cos", "exp", "log", "square", "cube", "sqrt", "abs", "tan", "tanh"] },
  { name: "niterations", type: "int", description: "", default: 40, range: [1, 10000], log: true },
  { name: "ncyclesperiteration", type: "int", description: "", default: 550, range: [1, 10000], log: true },
  { name: "populations", type: "int", description: "", default: 15, range: [2, 1000], log: true },
  { name: "population_size", type: "int", description: "", default: 33, range: [5, 1000], log: true },
  { name: "maxsize", type: "int", description: "", default: 20, range: [10, 100], log: false },
  { name: "timeout_in_seconds", type: "int", description: "", default: 1, range: [1, 10000], log: true, selectable: true },
  { name: "loss", type: "str", description: "", default: "L2DistLoss()", choices: ["L2DistLoss()", "L1DistLoss()"] },
  { name: "denoise", type: "bool", description: "", default: false, boolean: true },
  { name: "select_k_features", type: "int", description: "", default: 0, range: [0, 10], log: false, selectable: true },
  { name: "precision", type: "int", description: "", default: 32, choices: [16, 32, 64] },
  { name: "turbo", type: "bool", description: "", default: false, boolean: true },
  { name: "parsimony", type: "float", description: "", default: 0.0032, range: [0.00001, 1000.000], log: true },
]

const parameters = _parameters.map((param) => {
  const full_name = param.name.replace(/_/g, ' ').replace(/(^|\s)[a-z]/g, (match) => match.toUpperCase());
  return { ...param, full_name }
});

function encodeFloatLog(value: number) {
  return Math.log10(value) * 1000;
}

function decodeFloatLog(value: number) {
  return Math.pow(10, value / 1000).toPrecision(3);
}


const IndexPage: React.FC = () => {

  // Create a state variable for each parameter, and a function to update it,
  // in a dictionary, so we can access them by name.
  const parameterDict: { [key: string]: [any, (value: any) => void] } = {};

  // Load:
  parameters.forEach((parameter) => {
    let paramDefault = parameter.default;
    if (parameter.range !== undefined && parameter.log) {
      paramDefault = encodeFloatLog(paramDefault);
    }
    const [value, setValue] = useState(paramDefault);
    parameterDict[parameter.name] = [value, setValue];
  });


  // Dictionary of functions to handle updates:
  const parameterHandlers: { [key: string]: (value: any) => void } = {};

  // Load handlers
  parameters.forEach((parameter) => {
    const [curValue, setValue] = parameterDict[parameter.name];
    if (parameter.choices !== undefined && parameter.type.startsWith("list")) {

      // List of choices (pick many)
      const handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const curValues = curValue as any[];
        const value = e.target.value;
        if (e.target.checked) {
          setValue([...curValues, value]);
        } else {
          setValue(curValues.filter((v) => v !== value));
        }
      };
      parameterHandlers[parameter.name] = handler;

    } else if (parameter.choices !== undefined) {

      // List of choices (pick one)
      const handler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value);
      };
      parameterHandlers[parameter.name] = handler;

    } else if (parameter.type === "float" || parameter.log == true) {

      // Number (like a range)
      const handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(parseFloat(e.target.value));
      };
      parameterHandlers[parameter.name] = handler;
    } else if (parameter.type === "int") {

      // Integer
      const handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(parseInt(e.target.value));
      };
      parameterHandlers[parameter.name] = handler;

    } else if (parameter.type === "str") {
      const handler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value);
      };
      parameterHandlers[parameter.name] = handler;
    } else if (parameter.type === "bool") {
      const handler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.checked);
      };
      parameterHandlers[parameter.name] = handler;
    };
  });

  // Output:
  const [output, setOutput] = useState("");


  useEffect(() => {
    Prism.highlightElement(document.querySelector("#code-block") as Element);
  }, [output]);


  // Define display:
  useEffect(() => {

    let output = `model = PySRRegressor(`;
    for (let parameter of parameters) {

      let [value, _setValue] = parameterDict[parameter.name];

      if (parameter.range !== undefined && parameter.log) {
        value = decodeFloatLog(value);
      }
      if (parameter.type === "int") {
        value = Math.round(value);
      }

      // If equal to the default, don't include it.
      if (parameter.default == value && !(parameter.name.includes("operators"))) {
        continue;
      }

      if (parameter.choices !== undefined && parameter.type.startsWith("list")) {
        output += `\n    ${parameter.name}=${JSON.stringify(value as string[]).replace(/,/g, ", ") + ", "}`;
      } else if (parameter.choices !== undefined && parameter.type === "str") {
        output += `\n    ${parameter.name}="${value}",`;
      } else if (parameter.choices !== undefined) {
        output += `\n    ${parameter.name}=${value},`;
      } else if (parameter.type === "int") {
        output += `\n    ${parameter.name}=${value},`;
      } else if (parameter.type === "float") {
        output += `\n    ${parameter.name}=${value},`;
      } else if (parameter.type === "str") {
        output += `\n    ${parameter.name}="${value}",`;
      } else if (parameter.type === "bool") {
        output += `\n    ${parameter.name}=${value ? "True" : "False"},`;
      };
    };
    output += `\n)`;
    setOutput(output);

  }, [parameterDict]);

  let formElements = [];

  for (let parameter of parameters) {
    let curElements = [];

    const popover = (
      <Popover id="popover-basic">
        <Popover.Header as="h3" style={{ fontFamily: 'monospace' }}>{parameter.name}</Popover.Header>
        <Popover.Body>
          {parameter.description}
        </Popover.Body>
      </Popover>
    );
    // Title:
    curElements.push(
      <Form.Label>
        <OverlayTrigger trigger="hover" placement="right" overlay={popover}>
          <u>{parameter.full_name}</u>
        </OverlayTrigger>
      </Form.Label>
    );

    if (parameter.choices !== undefined && parameter.type.startsWith("list")) {

      // List of choices:
      curElements.push(
        <div>
          <Container>
            <Row key={`row-${parameter.name}`}>
              {(parameter.choices as any[]).map((choice) => (
                <Col xs={3} key={`col-${parameter.name}-${choice}`}>
                  <Form.Check type="checkbox" id={`id-operator-${choice}`}>
                    <Form.Check.Label style={{ fontFamily: 'monospace' }}>{choice}</Form.Check.Label>
                    <Form.Check.Input
                      type="checkbox"
                      value={choice}
                      onChange={parameterHandlers[parameter.name]}
                      checked={parameterDict[parameter.name][0].includes(choice)}
                    />
                  </Form.Check>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      );
    } else if (parameter.choices !== undefined) {

      // Only one choise among list:
      curElements.push(
        <div>
          <Container>
            <Row key={`row-${parameter.name}`}>
              {(parameter.choices as any[]).map((choice) => (
                <Col xs={3} key={`col-${parameter.name}-${choice}`}>
                  <Form.Check type="radio" id={`id-operator-${choice}`}>
                    <Form.Check.Label>{choice}</Form.Check.Label>
                    <Form.Check.Input
                      type="radio"
                      value={choice}
                      onChange={parameterHandlers[parameter.name]}
                      checked={parameterDict[parameter.name][0] == choice}
                    />
                  </Form.Check>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      );
    } else if (parameter.range !== undefined) {
      let value: any = parameter.log ? decodeFloatLog(parameterDict[parameter.name][0]) : parameterDict[parameter.name][0];
      if (parameter.type === "int") {
        value = Math.round(value);
      }
      if (parameter.selectable === true && ((parameter.log === true && value === 1) || (parameter.log === false && value === 0))) {
        value = "Off";
      }
      curElements.push(
        <div>
          <Form.Range
            min={parameter.log ? encodeFloatLog(parameter.range[0]) : parameter.range[0]}
            max={parameter.log ? encodeFloatLog(parameter.range[1]) : parameter.range[1]}
            step={1}
            value={parameterDict[parameter.name][0]}
            onChange={parameterHandlers[parameter.name]}
          />
          <output className="d-flex justify-content-center">{value}</output>
        </div>
      );
    } else if (parameter.type === "bool") {
      curElements.push(
        <div>
          <Form.Check type="switch" id={`id-operator-${parameter.name}`}>
            <Form.Check.Input
              type="checkbox"
              onChange={parameterHandlers[parameter.name]}
              checked={parameterDict[parameter.name][0]}
            />
          </Form.Check>
        </div>
      );
    }
    formElements.push(
      <div>
        {curElements}
      </div>
    );
    formElements.push(<br />);
  }

  const form = (
    <Form>
      {formElements.map((el) => (
        <Form.Group>
          {el}
        </Form.Group>
      ))}
    </Form>
  )

  const output_card = (
    <Card>
      <Card.Body>
        <pre>
          <code className="language-python" id="code-block">{output}</code>
        </pre>
        <hr />
        <Button onClick={(event) => {
          event.preventDefault();
          navigator.clipboard.writeText(output);
        }}>Copy Definition</Button>
      </Card.Body>
    </Card>
  );

  let out = (
    <div>
      <div className="d-flex justify-content-center align-items-center">
        {form}
      </div>
      <div className="d-flex justify-content-center align-items-center">
        {output_card}
      </div>
    </div>
  );

  return out;
};

export default IndexPage;
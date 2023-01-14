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

const parameterDescriptions: { [key: string]: any } = {};
parameterDescriptions["model_selection"] = (<div>Model selection criterion when selecting a final expression from the list of best expression at each complexity. Can be <code>'accuracy'</code>, <code>'best'</code>, or <code>'score'</code>. Default is <code>'best'</code>. <code>'accuracy'</code> selects the candidate model with the lowest loss (highest accuracy). <code>'score'</code> selects the candidate model with the highest score. Score is defined as the negated derivative of the log-loss with respect to complexity - if an expression has a much better loss at a slightly higher complexity, it is preferred. <code>'best'</code> selects the candidate model with the highest score among expressions with a loss better than at least 1.5x the most accurate model.</div>);
parameterDescriptions["binary_operators"] = (<div>List of strings for binary operators used in the search. See the [operators page](https://astroautomata.com/PySR/operators/) for more details. Default is <code>['+', '-', '*', '/']</code>.</div>);
parameterDescriptions["unary_operators"] = (<div>Operators which only take a single scalar as input. For example, <code>'cos'</code> or <code>'exp'</code>. Default is <code>None</code>.</div>);
parameterDescriptions["niterations"] = (<div>Number of iterations of the algorithm to run. The best equations are printed and migrate between populations at the end of each iteration. Default is <code>40</code>.</div>);
parameterDescriptions["populations"] = (<div>Number of populations running. Default is <code>15</code>.</div>);
parameterDescriptions["population_size"] = (<div>Number of individuals in each population. Default is <code>33</code>.</div>);
parameterDescriptions["max_evals"] = (<div>Limits the total number of evaluations of expressions to this number.  Default is <code>None</code>.</div>);
parameterDescriptions["maxsize"] = (<div>Max complexity of an equation.  Default is <code>20</code>.</div>);
parameterDescriptions["maxdepth"] = (<div>Max depth of an equation. You can use both <code>maxsize</code> and <code>maxdepth</code>. <code>maxdepth</code> is by default not used. Default is <code>None</code>.</div>);
parameterDescriptions["warmup_maxsize_by"] = (<div>Whether to slowly increase max size from a small number up to the maxsize (if greater than 0).  If greater than 0, says the fraction of training time at which the current maxsize will reach the user-passed maxsize. Default is <code>0.0</code>.</div>);
parameterDescriptions["timeout_in_seconds"] = (<div>Make the search return early once this many seconds have passed. Default is <code>None</code>.</div>);
parameterDescriptions["constraints"] = (<div>Dictionary of int (unary) or 2-tuples (binary), this enforces maxsize constraints on the individual arguments of operators. E.g., <code>'pow': (-1, 1)</code> says that power laws can have any complexity left argument, but only 1 complexity in the right argument. Use this to force more interpretable solutions. Default is <code>None</code>.</div>);
parameterDescriptions["nested_constraints"] = (<div>Specifies how many times a combination of operators can be nested. For example, <code>&#123;'sin': &#123;'cos': 0&#125;&#125;, 'cos': &#123;'cos': 2&#125;&#125;</code> specifies that <code>cos</code> may never appear within a <code>sin</code>, but <code>sin</code> can be nested with itself an unlimited number of times. The second term specifies that <code>cos</code> can be nested up to 2 times within a <code>cos</code>, so that <code>cos(cos(cos(x)))</code> is allowed (as well as any combination of <code>+</code> or <code>-</code> within it), but <code>cos(cos(cos(cos(x))))</code> is not allowed. When an operator is not specified, it is assumed that it can be nested an unlimited number of times. This requires that there is no operator which is used both in the unary operators and the binary operators (e.g., <code>-</code> could be both subtract, and negation). For binary operators, you only need to provide a single number: both arguments are treated the same way, and the max of each argument is constrained. Default is <code>None</code>.</div>);
parameterDescriptions["loss"] = (<div>String of Julia code specifying the loss function. Can either be a loss from LossFunctions.jl, or your own loss written as a function. Examples of custom written losses include: <code>myloss(x, y) = abs(x-y)</code> for non-weighted, or <code>myloss(x, y, w) = w*abs(x-y)</code> for weighted. The included losses include: Regression: <code>LPDistLoss&#123;P&#125;()</code>, <code>L1DistLoss()</code>, <code>L2DistLoss()</code> (mean square), <code>LogitDistLoss()</code>, <code>HuberLoss(d)</code>, <code>L1EpsilonInsLoss(ϵ)</code>, <code>L2EpsilonInsLoss(ϵ)</code>, <code>PeriodicLoss(c)</code>, <code>QuantileLoss(τ)</code>. Classification: <code>ZeroOneLoss()</code>, <code>PerceptronLoss()</code>, <code>L1HingeLoss()</code>, <code>SmoothedL1HingeLoss(γ)</code>, <code>ModifiedHuberLoss()</code>, <code>L2MarginLoss()</code>, <code>ExpLoss()</code>, <code>SigmoidLoss()</code>, <code>DWDMarginLoss(q)</code>. Default is <code>'L2DistLoss()'</code>.</div>);
parameterDescriptions["complexity_of_operators"] = (<div>If you would like to use a complexity other than 1 for an operator, specify the complexity here. For example, <code>&#123;'sin': 2, '+': 1&#125;</code> would give a complexity of 2 for each use of the <code>sin</code> operator, and a complexity of 1 for each use of the <code>+</code> operator (which is the default). You may specify real numbers for a complexity, and the total complexity of a tree will be rounded to the nearest integer after computing. Default is <code>None</code>.</div>);
parameterDescriptions["complexity_of_constants"] = (<div>Complexity of constants. Default is <code>1</code>.</div>);
parameterDescriptions["complexity_of_variables"] = (<div>Complexity of variables. Default is <code>1</code>.</div>);
parameterDescriptions["parsimony"] = (<div>Multiplicative factor for how much to punish complexity. Default is <code>0.0032</code>.</div>);
parameterDescriptions["use_frequency"] = (<div>Whether to measure the frequency of complexities, and use that instead of parsimony to explore equation space. Will naturally find equations of all complexities. Default is <code>True</code>.</div>);
parameterDescriptions["use_frequency_in_tournament"] = (<div>Whether to use the frequency mentioned above in the tournament, rather than just the simulated annealing. Default is <code>True</code>.</div>);
parameterDescriptions["adaptive_parsimony_scaling"] = (<div>If the adaptive parsimony strategy (<code>use_frequency</code> and <code>use_frequency_in_tournament</code>), this is how much to (exponentially) weight the contribution. If you find that the search is only optimizing the most complex expressions while the simpler expressions remain stagnant, you should increase this value. Default is <code>20.0</code>.</div>);
parameterDescriptions["alpha"] = (<div>Initial temperature for simulated annealing (requires <code>annealing</code> to be <code>True</code>). Default is <code>0.1</code>.</div>);
parameterDescriptions["annealing"] = (<div>Whether to use annealing.  Default is <code>False</code>.</div>);
parameterDescriptions["early_stop_condition"] = (<div>Stop the search early if this loss is reached. You may also pass a string containing a Julia function which takes a loss and complexity as input, for example: <code>'f(loss, complexity) = (loss &lt; 0.1) && (complexity &lt; 10)'</code>. Default is <code>None</code>.</div>);
parameterDescriptions["ncyclesperiteration"] = (<div>Number of total mutations to run, per 10 samples of the population, per iteration. Default is <code>550</code>.</div>);
parameterDescriptions["fraction_replaced"] = (<div>How much of population to replace with migrating equations from other populations. Default is <code>0.000364</code>.</div>);
parameterDescriptions["fraction_replaced_hof"] = (<div>How much of population to replace with migrating equations from hall of fame. Default is <code>0.035</code>.</div>);
parameterDescriptions["weight_add_node"] = (<div>Relative likelihood for mutation to add a node. Default is <code>0.79</code>.</div>);
parameterDescriptions["weight_insert_node"] = (<div>Relative likelihood for mutation to insert a node. Default is <code>5.1</code>.</div>);
parameterDescriptions["weight_delete_node"] = (<div>Relative likelihood for mutation to delete a node. Default is <code>1.7</code>.</div>);
parameterDescriptions["weight_do_nothing"] = (<div>Relative likelihood for mutation to leave the individual. Default is <code>0.21</code>.</div>);
parameterDescriptions["weight_mutate_constant"] = (<div>Relative likelihood for mutation to change the constant slightly in a random direction. Default is <code>0.048</code>.</div>);
parameterDescriptions["weight_mutate_operator"] = (<div>Relative likelihood for mutation to swap an operator. Default is <code>0.47</code>.</div>);
parameterDescriptions["weight_randomize"] = (<div>Relative likelihood for mutation to completely delete and then randomly generate the equation Default is <code>0.00023</code>.</div>);
parameterDescriptions["weight_simplify"] = (<div>Relative likelihood for mutation to simplify constant parts by evaluation Default is <code>0.0020</code>.</div>);
parameterDescriptions["weight_optimize"] = (<div>Constant optimization can also be performed as a mutation, in addition to the normal strategy controlled by <code>optimize_probability</code> which happens every iteration. Using it as a mutation is useful if you want to use a large <code>ncyclesperiteration</code>, and may not optimize very often. Default is <code>0.0</code>.</div>);
parameterDescriptions["crossover_probability"] = (<div>Absolute probability of crossover-type genetic operation, instead of a mutation. Default is <code>0.066</code>.</div>);
parameterDescriptions["skip_mutation_failures"] = (<div>Whether to skip mutation and crossover failures, rather than simply re-sampling the current member. Default is <code>True</code>.</div>);
parameterDescriptions["migration"] = (<div>Whether to migrate.  Default is <code>True</code>.</div>);
parameterDescriptions["hof_migration"] = (<div>Whether to have the hall of fame migrate.  Default is <code>True</code>.</div>);
parameterDescriptions["topn"] = (<div>How many top individuals migrate from each population. Default is <code>12</code>.</div>);
parameterDescriptions["should_optimize_constants"] = (<div>Whether to numerically optimize constants (Nelder-Mead/Newton) at the end of each iteration. Default is <code>True</code>.</div>);
parameterDescriptions["optimizer_algorithm"] = (<div>Optimization scheme to use for optimizing constants. Can currently be <code>NelderMead</code> or <code>BFGS</code>. Default is <code>'BFGS'</code>.</div>);
parameterDescriptions["optimizer_nrestarts"] = (<div>Number of time to restart the constants optimization process with different initial conditions. Default is <code>2</code>.</div>);
parameterDescriptions["optimize_probability"] = (<div>Probability of optimizing the constants during a single iteration of the evolutionary algorithm. Default is <code>0.14</code>.</div>);
parameterDescriptions["optimizer_iterations"] = (<div>Number of iterations that the constants optimizer can take. Default is <code>8</code>.</div>);
parameterDescriptions["perturbation_factor"] = (<div>Constants are perturbed by a max factor of (perturbation_factor*T + 1). Either multiplied by this or divided by this. Default is <code>0.076</code>.</div>);
parameterDescriptions["tournament_selection_n"] = (<div>Number of expressions to consider in each tournament. Default is <code>10</code>.</div>);
parameterDescriptions["tournament_selection_p"] = (<div>Probability of selecting the best expression in each tournament. The probability will decay as p*(1-p)^n for other expressions, sorted by loss. Default is <code>0.86</code>.</div>);
parameterDescriptions["procs"] = (<div>Number of processes (=number of populations running). Default is <code>cpu_count()</code>.</div>);
parameterDescriptions["multithreading"] = (<div>Use multithreading instead of distributed backend. Using procs=0 will turn off both. Default is <code>True</code>.</div>);
parameterDescriptions["cluster_manager"] = (<div>For distributed computing, this sets the job queue system. Set to one of 'slurm', 'pbs', 'lsf', 'sge', 'qrsh', 'scyld', or 'htc'. If set to one of these, PySR will run in distributed mode, and use <code>procs</code> to figure out how many processes to launch. Default is <code>None</code>.</div>);
parameterDescriptions["batching"] = (<div>Whether to compare population members on small batches during evolution. Still uses full dataset for comparing against hall of fame. Default is <code>False</code>.</div>);
parameterDescriptions["batch_size"] = (<div>The amount of data to use if doing batching. Default is <code>50</code>.</div>);
parameterDescriptions["fast_cycle"] = (<div>Batch over population subsamples. This is a slightly different algorithm than regularized evolution, but does cycles 15% faster. May be algorithmically less efficient. Default is <code>False</code>.</div>);
parameterDescriptions["turbo"] = (<div>(Experimental) Whether to use LoopVectorization.jl to speed up the search evaluation. Certain operators may not be supported. Does not support 16-bit precision floats. Default is <code>False</code>.</div>);
parameterDescriptions["precision"] = (<div>What precision to use for the data. By default this is <code>32</code> (float32), but you can select <code>64</code> or <code>16</code> as well, giving you 64 or 16 bits of floating point precision, respectively. Default is <code>32</code>.</div>);
parameterDescriptions["random_state"] = (<div>Pass an int for reproducible results across multiple function calls. See :term:<code>Glossary &lt;random_state&gt;</code>. Default is <code>None</code>.</div>);
parameterDescriptions["deterministic"] = (<div>Make a PySR search give the same result every run. To use this, you must turn off parallelism (with <code>procs</code>=0, <code>multithreading</code>=False), and set <code>random_state</code> to a fixed seed. Default is <code>False</code>.</div>);
parameterDescriptions["warm_start"] = (<div>Tells fit to continue from where the last call to fit finished. If false, each call to fit will be fresh, overwriting previous results. Default is <code>False</code>.</div>);
parameterDescriptions["verbosity"] = (<div>What verbosity level to use. 0 means minimal print statements. Default is <code>1e9</code>.</div>);
parameterDescriptions["update_verbosity"] = (<div>What verbosity level to use for package updates. Will take value of <code>verbosity</code> if not given. Default is <code>None</code>.</div>);
parameterDescriptions["progress"] = (<div>Whether to use a progress bar instead of printing to stdout. Default is <code>True</code>.</div>);
parameterDescriptions["equation_file"] = (<div>Where to save the files (.csv extension). Default is <code>None</code>.</div>);
parameterDescriptions["temp_equation_file"] = (<div>Whether to put the hall of fame file in the temp directory. Deletion is then controlled with the <code>delete_tempfiles</code> parameter. Default is <code>False</code>.</div>);
parameterDescriptions["tempdir"] = (<div>directory for the temporary files. Default is <code>None</code>.</div>);
parameterDescriptions["delete_tempfiles"] = (<div>Whether to delete the temporary files after finishing. Default is <code>True</code>.</div>);
parameterDescriptions["julia_project"] = (<div>A Julia environment location containing a Project.toml (and potentially the source code for SymbolicRegression.jl). Default gives the Python package directory, where a Project.toml file should be present from the install.</div>);
parameterDescriptions["update"] = (<div>Whether to automatically update Julia packages when <code>fit</code> is called. You should make sure that PySR is up-to-date itself first, as the packaged Julia packages may not necessarily include all updated dependencies. Default is <code>False</code>.</div>);
parameterDescriptions["output_jax_format"] = (<div>Whether to create a 'jax_format' column in the output, containing jax-callable functions and the default parameters in a jax array. Default is <code>False</code>.</div>);
parameterDescriptions["output_torch_format"] = (<div>Whether to create a 'torch_format' column in the output, containing a torch module with trainable parameters. Default is <code>False</code>.</div>);
parameterDescriptions["extra_sympy_mappings"] = (<div>Provides mappings between custom <code>binary_operators</code> or <code>unary_operators</code> defined in julia strings, to those same operators defined in sympy. E.G if <code>unary_operators=['inv(x)=1/x']</code>, then for the fitted model to be export to sympy, <code>extra_sympy_mappings</code> would be <code>&#123;'inv': lambda x: 1/x&#125;</code>. Default is <code>None</code>.</div>);
parameterDescriptions["extra_jax_mappings"] = (<div>Similar to <code>extra_sympy_mappings</code> but for model export to jax. The dictionary maps sympy functions to jax functions. For example: <code>extra_jax_mappings=&#123;sympy.sin: 'jnp.sin'&#125;</code> maps the <code>sympy.sin</code> function to the equivalent jax expression <code>jnp.sin</code>. Default is <code>None</code>.</div>);
parameterDescriptions["extra_torch_mappings"] = (<div>The same as <code>extra_jax_mappings</code> but for model export to pytorch. Note that the dictionary keys should be callable pytorch expressions. For example: <code>extra_torch_mappings=&#123;sympy.sin: torch.sin&#125;</code>. Default is <code>None</code>.</div>);
parameterDescriptions["denoise"] = (<div>Whether to use a Gaussian Process to denoise the data before inputting to PySR. Can help PySR fit noisy data. Default is <code>False</code>.</div>);
parameterDescriptions["select_k_features"] = (<div>Whether to run feature selection in Python using random forests, before passing to the symbolic regression code. None means no feature selection; an int means select that many features. Default is <code>None</code>.</div>);
parameterDescriptions["julia_kwargs"] = (<div>Keyword arguments to pass to <code>julia.core.Julia(...)</code> to initialize the Julia runtime. The default, when <code>None</code>, is to set <code>threads</code> equal to <code>procs</code>, and <code>optimize</code> to 3. Default is <code>None</code>.</div>);
parameterDescriptions["**kwargs"] = (<div>Supports deprecated keyword arguments. Other arguments will result in an error.</div>);
parameterDescriptions["equations_"] = (<div>Processed DataFrame containing the results of model fitting.</div>);
parameterDescriptions["n_features_in_"] = (<div>Number of features seen during :term:<code>fit</code>.</div>);
parameterDescriptions["feature_names_in_"] = (<div>Names of features seen during :term:<code>fit</code>. Defined only when <code>X</code> has feature names that are all strings.</div>);
parameterDescriptions["nout_"] = (<div>Number of output dimensions.</div>);
parameterDescriptions["selection_mask_"] = (<div>List of indices for input features that are selected when <code>select_k_features</code> is set.</div>);
parameterDescriptions["tempdir_"] = (<div>Path to the temporary equations directory.</div>);
parameterDescriptions["equation_file_"] = (<div>Output equation file name produced by the julia backend.</div>);
parameterDescriptions["raw_julia_state_"] = (<div>The state for the julia SymbolicRegression.jl backend post fitting.</div>);
parameterDescriptions["equation_file_contents_"] = (<div>Contents of the equation file output by the Julia backend.</div>);
parameterDescriptions["show_pickle_warnings_"] = (<div>Whether to show warnings about what attributes can be pickled.</div>);

const parameters = _parameters.map((param) => {
  const full_name = param.name.replace(/_/g, ' ').replace(/(^|\s)[a-z]/g, (match) => match.toUpperCase());
  // return { ...param, full_name }
  const description = parameterDescriptions[param.name];
  return { ...param, full_name, description }
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
        <OverlayTrigger trigger={["hover", "focus"]} placement="right" overlay={popover}>
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
                <Col xs={4} key={`col-${parameter.name}-${choice}`}>
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
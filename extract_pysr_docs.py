from pysr import PySRRegressor
from docstring_parser import parse
import re

docs = parse(PySRRegressor.__doc__)

descriptions = {p.arg_name: p.description for p in docs.params}

# Print this out in TypeScript format, so that it
# can be loaded into a dictionary. We must sanitize
# occurrences of ` and " in the descriptions.
# We sanitize `...` into a <code>...</code> block.
# We also need to concatenate the descriptions
# into single lines.
# We also need to sanitize { and } into &#123; and &#125;.
# We also need to sanitize < and > into &lt; and &gt;.
# Finally, we want to output every string as a JSX.Element,
# rather than a literal string.


for arg_name, description in descriptions.items():
    # Remove curly braces.
    description = description.replace("{", "&#123;")
    description = description.replace("}", "&#125;")
    # Remove angle brackets.
    description = description.replace("<", "&lt;")
    description = description.replace(">", "&gt;")
    # Put everything between `...` into a <code>...</code> block.
    description = re.sub(r"`([^`]+)`", r"<code>\1</code>", description)
    # Remove newlines.
    description = description.replace("\n", " ")
    # Remove double quotes.
    description = description.replace('"', "'")
    # Wrap the description in a <div>...</div> block.
    print(f'parameterDescriptions["{arg_name}"] = (<div>{description}</div>);')

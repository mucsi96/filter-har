const { readFileSync, writeFileSync } = require("fs");
const { basename } = require("path");
const YAML = require("yaml");
[, , inFile] = process.argv;
const outFile = `${basename(inFile, ".har")}.yaml`;

writeFileSync(outFile, filterHar(readFileSync(inFile, "utf8")), "utf8");

function filterHar(harString) {
  const {
    log: { entries },
  } = JSON.parse(harString);
  const result = entries.reduce((acc, { _resourceType, request, response }) => {
    if (_resourceType !== "xhr" && _resourceType !== "fetch") {
      return acc;
    }

    return [
      ...acc,
      {
        request: {
          method: request.method,
          url: request.url,
          ...(request.postData?.mimeType === "application/json" && {
            body: JSON.parse(request.postData.text),
          }),
        },
        response: {
          status: response.status,
          ...(response.content?.mimeType === "application/json" && {
            body: JSON.parse(response.content.text),
          }),
        },
      },
    ];
  }, []);
  return YAML.stringify(result);
}

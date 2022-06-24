const stdin = process.openStdin();

let data = "";

stdin.on("data", function (chunk) {
  data += chunk;
});

stdin.on("end", function () {
  console.log(filterHar(data));
});

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
  return JSON.stringify(result, undefined, 2)
    .replace(/[{}"\[\]]/g, "")
    .replace(/:/g, ": ")
    .replace(/,/g, "")
    .split("\n")
    .map((line) => line.slice(4))
    .filter((line) => line.trim())
    .join("\n");
}

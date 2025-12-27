/**
 * Build a FormData object using a mapping like:
 *   { "entry.1626330596": "LastName", ... }
 * so the FormData keys become the Google Form entry IDs,
 * and the values come from dataObj fields.
 *
 * @param {Record<string, any>} dataObj
 * @param {Record<string, string>} googleFormFieldMapping - { entryId: dataObjKey }
 * @param {Object} [opts]
 * @param {boolean} [opts.skipEmpty=true] - skip undefined/null/"" values
 * @param {(value:any, dataKey:string, entryKey:string)=>any} [opts.transform] - optional value transform
 * @returns {FormData}
 */
function buildFormDataFromMapping(
  dataObj,
  googleFormFieldMapping = {
    "entry.1626330596": "LastName",
    "entry.136424511": "Phone",
    "entry.519333152": "LeadSource",
    "entry.1280123435": "LeadStatus",
    "entry.1488356583": "Mobile",
    "entry.1839678801": "Email",
    "entry.1087355500": "Company",
    "entry.715099283": "Website",
    "entry.517102893": "Industry",
    "entry.2143563606": "Description",
    "entry.1125463290": "Agent",
  },
  opts = {}
) {
  const { skipEmpty = true, transform } = opts;

  const fd = new FormData();

  for (const [entryKey, dataKey] of Object.entries(googleFormFieldMapping)) {
    let value = dataObj?.[dataKey];

    if (transform) value = transform(value, dataKey, entryKey);

    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    if (skipEmpty && isEmpty) continue;

    // FormData values should be strings (or Blob/File). We'll stringify primitives safely.
    if (
      typeof value === "object" &&
      !(value instanceof Blob) &&
      !(value instanceof File)
    ) {
      value = JSON.stringify(value);
    }

    fd.append(
      entryKey,
      value instanceof Blob || value instanceof File ? value : String(value)
    );
  }

  return fd;
}

async function googleSubmition(dataObj) {
  const googleFormURL = `https://docs.google.com/forms/u/0/d/e/1FAIpQLSfzjFRYjOxwEG4JuqVzdj6IIO9v7D14d3CQVM9z0BKZypbx_Q/formResponse`;
  const response = await fetch(googleFormURL, {
    method: "POST",
    mode: "no-cors", // Required for Google Forms
    body: buildFormDataFromMapping(dataObj),
  });
  return { ok: true, status: response.status, data: response };
}
export { googleSubmition };

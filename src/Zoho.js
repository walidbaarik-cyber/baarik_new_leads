/**
 * Submit a Zoho CRM WebToLead without any form element in the DOM.
 *
 * @param {Object} dataObj - Your lead data (your keys).
 * @param {Object} tokens - Required Zoho WebToLead hidden fields from the generated form.
 * @param {string} tokens.xnQsjsdp
 * @param {string} tokens.xmIwtLD
 * @param {string} [tokens.actionType="TGVhZHM="]
 * @param {string} [tokens.returnURL="null"]
 * @param {string} [tokens.zc_gad=""]
 * @param {string} [tokens.aG9uZXlwb3Q=""]  // honeypot should be empty
 * @param {string} [opts.endpoint="https://crm.zoho.com/crm/WebToLeadForm"]
 *
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function submitLeadToZoho(
  dataObj,
  opts = {},
  tokens = {
    xnQsjsdp:
      "e36ac146e982c98006421e7011bea5d211149b66191d53faaf5265f66411a455",
    xmIwtLD:
      "5030f7d61127ab0dd2786428ce3aa71971c5f0a635d1afee82a9199f512561605d5ebdccb63489a8b9939ba90577a564",
    actionType: "TGVhZHM=",
    returnURL: "null",
    zc_gad: "",
    aG9uZXlwb3Q: "",
  }
) {
  const endpoint = opts.endpoint || "https://crm.zoho.com/crm/WebToLeadForm";

  if (!tokens?.xnQsjsdp || !tokens?.xmIwtLD) {
    throw new Error("Missing required tokens: xnQsjsdp and xmIwtLD.");
  }

  // Your keys -> Zoho "name" attributes (must match exactly)
  const fieldMap = {
    LastName: "Last Name",
    Phone: "Phone",
    LeadSource: "Lead Source",
    LeadStatus: "Lead Status",
    Mobile: "Mobile",
    Email: "Email",
    Company: "Company",
    Website: "Website",
    Industry: "Industry",
    Description: "Description",
  };

  // In your example, you had a weird key: "Attempted to Contact"
  // That is a *Lead Status value*, not a field name, but we support it anyway.
  const leadStatusValue =
    dataObj.LeadStatus ?? dataObj["Attempted to Contact"] ?? undefined;

  // Build the POST body
  const fd = new FormData();

  // Required Zoho hidden fields
  fd.append("xnQsjsdp", tokens.xnQsjsdp);
  fd.append("xmIwtLD", tokens.xmIwtLD);
  fd.append("actionType", tokens.actionType ?? "TGVhZHM=");
  fd.append("returnURL", tokens.returnURL ?? "null");
  fd.append("zc_gad", tokens.zc_gad ?? "");
  fd.append("aG9uZXlwb3Q", tokens.aG9uZXlwb3Q ?? ""); // must stay empty

  // Lead fields
  for (const [yourKey, zohoFieldName] of Object.entries(fieldMap)) {
    if (yourKey === "LeadStatus") continue; // handled below
    const val = dataObj[yourKey];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      fd.append(zohoFieldName, String(val));
    }
  }
  if (
    leadStatusValue !== undefined &&
    leadStatusValue !== null &&
    String(leadStatusValue).trim() !== ""
  ) {
    fd.append("Lead Status", String(leadStatusValue));
  }

  // Minimal validation (same mandatory as your form)
  const lastName = (fd.get("Last Name") || "").toString().trim();
  const phone = (fd.get("Phone") || "").toString().trim();
  if (!lastName) throw new Error("LastName is required.");
  if (!phone) throw new Error("Phone is required.");

  const res = await fetch(endpoint, { method: "POST", body: fd });

  // Zoho often replies with text/html or plain text. Sometimes JSON.
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  return { ok: res.ok, status: res.status, data };
}

export { submitLeadToZoho };

/** Example usage */
// (async () => {
//   const dataObj = {
//     LastName: "Doe",
//     Phone: "0123456789",
//     LeadSource: "WhatsApp",
//     LeadStatus: "Attempted to Contact",
//     Mobile: "0100000000",
//     Email: "doe@example.com",
//     Company: "Acme",
//     Website: "https://acme.test",
//     Industry: "-None-", // or one of the exact option values
//     Description: "Lead from API",
//   };

//   // Copy these directly from your Zoho form HTML:
//   const tokens = {
//     xnQsjsdp:
//       "e36ac146e982c98006421e7011bea5d211149b66191d53faaf5265f66411a455",
//     xmIwtLD:
//       "5030f7d61127ab0dd2786428ce3aa71971c5f0a635d1afee82a9199f512561605d5ebdccb63489a8b9939ba90577a564",
//     actionType: "TGVhZHM=",
//     returnURL: "null",
//     zc_gad: "",
//     aG9uZXlwb3Q: "",
//   };

//   const result = await submitLeadToZoho(dataObj, tokens);
//   console.log(result);
// })();

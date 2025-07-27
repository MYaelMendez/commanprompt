// DomainAgent: Manage DNS records for AT Protocol handles via Namecheap
// This is a prototype showing how the onboarding agent could automate
// ownership verification for a domain. Network access is disabled in
// this environment, so the actual API calls are placeholders.

const https = require('https');
const querystring = require('querystring');

// Helper to perform a GET request to Namecheap's API
function namecheapRequest(params) {
  const query = querystring.stringify(params);
  const options = {
    hostname: 'api.namecheap.com',
    path: `/xml.response?${query}`,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

// Update the _atproto TXT record for a domain
async function setAtprotoRecord({
  apiUser,
  apiKey,
  userName,
  clientIp,
  domain,
  tld,
  did
}) {
  const params = {
    ApiUser: apiUser,
    ApiKey: apiKey,
    UserName: userName,
    ClientIp: clientIp,
    Command: 'namecheap.domains.dns.setHosts',
    SLD: domain,
    TLD: tld,
    HostName1: '_atproto',
    RecordType1: 'TXT',
    Address1: `did=${did}`,
    TTL1: '60'
  };
  const response = await namecheapRequest(params);
  return response;
}

// Poll until the DNS record matches the DID
async function verifyRecord({ domain, did }) {
  // Implementation would query DNS servers for TXT record and compare.
  // Placeholder returns immediately.
  console.log(`Verifying that _atproto.${domain} resolves to did=${did}...`);
  return true;
}

module.exports = { setAtprotoRecord, verifyRecord };

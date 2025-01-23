const core = require('@actions/core');
const axios = require('axios');
const FormData = require('form-data');

(async () => {
  try {
    //get inputs
    const mta = core.getInput('mta');
    const credentials = core.getInput('credentials');
    const namedUser = core.getInput('namedUser');
    const nodeName = core.getInput('nodeName');
    const transportDescription = core.getInput('transportDescription');

    //parse credentials
    const parsedCredentials = JSON.parse(credentials);
    const clientid = parsedCredentials.uaa.clientid;
    const clientsecret = parsedCredentials.uaa.clientsecret;
    const url = `${parsedCredentials.uaa.url}/oauth/token`;
    const apiUrl = `${parsedCredentials.uri}/v2`;

    //get token
    const authResponse = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'      
     },
      auth: {
        username: clientid,
        password: clientsecret
      },
      params: {
        grant_type: 'client_credentials'
      }
    });
    const token = authResponse.data.access_token;
    core.info(`Token fetched successfully`);

    //upload mta
    const form = new FormData();
    form.append('file', mta);
    if (namedUser) {
      form.append('namedUser', namedUser);
    }

    const uploadResponse = await axios.post(`${apiUrl}/files/upload`, form, {
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form.getHeaders()
        },
    });
    const fileId = uploadResponse.data.fileId;
    core.info(`MTA file uploaded successfully`);

    //upload to transport node
    const nodeData = {
        description: transportDescription,
        entries: [{ uri: fileId }],
        nodeName: nodeName,
        contentType: 'MTA',
        storageType: 'FILE'
    }
    if (namedUser) {
      nodeData.namedUser = namedUser;
    }

    const transportResponse = await axios.post(`${apiUrl}/nodes/upload`, nodeData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    const requestId = transportResponse.data.transportRequestId;
    core.info(`Transport Request ${requestId} created successfully`);

  } catch (error) {
    core.setFailed(`Error occurred: ${error.message}`);
  }
});
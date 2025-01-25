const core = require('@actions/core');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function main() {
  try {   
    //get inputs
    const mtaPath = core.getInput('mta');
    //get file name from path
    const mtaFileName = mtaPath.split('/').pop();
    const credentials = core.getInput('credentials');
    const namedUser = core.getInput('namedUser');
    const nodeName = core.getInput('nodeName');
    const transportDescription = core.getInput('transportDescription');

    //check if file exists
    if (!fs.existsSync(mtaPath)) {
      throw new Error(`MTA file does not exist: ${mtaPath}`);
    }
    core.info(`MTA file exists: ${mtaPath}`);

    //read file
    const mtaContent = fs.readFileSync(mtaPath);
    core.info(`MTA content type: ${typeof mtaContent}`);
    core.info(`MTA file size: ${mtaContent.length} bytes`);    

    //parse credentials
    const parsedCredentials = JSON.parse(credentials);
    const clientid = parsedCredentials.uaa.clientid;
    const clientsecret = parsedCredentials.uaa.clientsecret;
    const url = `${parsedCredentials.uaa.url}/oauth/token`;
    const apiUrl = `${parsedCredentials.uri}/v2`;

    //output parsed credentials
    core.info(`API URL: ${apiUrl}`);

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
    form.append('file', mtaContent, mtaFileName);
    if (namedUser) {
      form.append('namedUser', namedUser);
    }

    const uploadResponse = await axios.post(`${apiUrl}/files/upload`, form, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
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
    console.error(`Error: ${error.message}`);
    core.setFailed(`Error occurred: ${error.message}`);
    if (error.response) {
      core.error(`Response status: ${error.response.status}`);
      core.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      core.error(`Response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    } else if (error.request) {
      core.error(`No response received: ${error.request}`);
    }
    core.error(`Request headers: ${JSON.stringify(error.config.headers, null, 2)}`);    
  }
}

main();
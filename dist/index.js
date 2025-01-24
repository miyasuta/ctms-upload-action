/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 424:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 775:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ }),

/***/ 846:
/***/ ((module) => {

module.exports = eval("require")("form-data");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(424);
const axios = __nccwpck_require__(775);
const FormData = __nccwpck_require__(846);

(async () => {
  try {
    core.info('Test message: The script has started');
    
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
module.exports = __webpack_exports__;
/******/ })()
;
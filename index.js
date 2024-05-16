const express = require('express');
const bodyParser = require('body-parser');
const tradingview = require('./tradingview'); // Assuming tradingview.js is your module

const app = express();
app.use(bodyParser.json());

app.get('/validate/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const tv = new tradingview();
    const response = await tv.validateUsername(username);  // Use await here
    res.json(response);
  } catch (e) {
    console.error("[X] Exception Occurred : ", e);
    const failureResponse = {
      errorMessage: 'Unknown Exception Occurred',
    };
    res.status(500).json(failureResponse);
  }
});
  
app.route('/readAccess/:username')
  .all((req, res, next) => {
    req.username = req.params.username;
    next();
  })
  .post(async (req, res) => {
    try {
      const jsonPayload = req.body;
      const pineIds = jsonPayload.pine_ids;
      const tv = new tradingview();
      const accessList = [];
      for (const pineId of pineIds) {
        const access = await tv.getAccessDetails(req.username, pineId);
        accessList.push(access);
      }
      res.json(accessList);

    } catch (e) {
      console.error("[X] Exception Occurred : ", e);
      const failureResponse = {
        errorMessage: 'Unknown Exception Occurred',
      };
      res.status(500).json(failureResponse);
    }
  });

app.route('/giveAccess/:username')
  .all((req, res, next) => {
    req.username = req.params.username;
    next();
  })
  .post(async (req, res) => {
    try {
      const jsonPayload = req.body;
      const pineIds = jsonPayload.pine_ids;
      const accessList = [];
      const tv = new tradingview();
      for (const pineId of pineIds) {
        await tv.getAccessDetails(req.username, pineId).then(async function(result) {
          const duration = jsonPayload.duration;
          const dNumber = parseInt(duration.slice(0, -1));
          const dType = duration.slice(-1);
          const access = await tv.addAccess(result, dType, dNumber);
          accessList.push(access);
        })
      }
      res.json(accessList);

    } catch (e) {
      console.error("[X] Exception Occurred : ", e);
      const failureResponse = {
        errorMessage: 'Unknown Exception Occurred',
      };
      res.status(500).json(failureResponse);
    }
  });
  
app.route('/removeAccess/:username')
  .all((req, res, next) => {
    req.username = req.params.username;
    next();
  })
  .post(async (req, res) => {
    try {
      const jsonPayload = req.body;
      const pineIds = jsonPayload.pine_ids;
      const accessList = [];
      const tv = new tradingview();
      for (const pineId of pineIds) {
        await tv.getAccessDetails(req.username, pineId).then(async function(result) {
          const access = await tv.removeAccess(result);
          accessList.push(access);
        })
      }
      res.json(accessList);

    } catch (e) {
      console.error("[X] Exception Occurred : ", e);
      const failureResponse = {
        errorMessage: 'Unknown Exception Occurred',
      };
      res.status(500).json(failureResponse);
    }
  });

app.get('/', (req, res) => {
  res.send('Your bot is alive!');
});

function startServer() {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();

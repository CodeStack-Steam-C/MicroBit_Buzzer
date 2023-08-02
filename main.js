const { app, BrowserWindow } = require('electron');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')

// Create a new Electron window
let mainWindow;

app.on('ready', () => {
  // Create the main window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // Load your HTML file
  mainWindow.loadFile('index.html');

  // Find and connect to the micro:bit device
  SerialPort.list().then((ports) => {
    const microbitPort = ports.find((port) => {
      if (port.vendorId) {
        return port.vendorId.toLowerCase().includes('0d28')
      }

      return false
      
    });

    if (microbitPort) {
      const port = new SerialPort({
        path: microbitPort.path,
        baudRate: 115200,
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      parser.on('data', function (data) {
        // Convert the received data to a string
        const receivedData = data.toString().trim();

        // Send the received data to the renderer process
        if (receivedData !== "") {
          mainWindow.webContents.send('microbitData', receivedData);
        }
      })

      port.write("NITRO#", function(err) {
        if (err) {
          mainWindow.webContents.send('microbitData', err);
          return console.log('Error:', err.message);
        }
        console.log('Data sent successfully!');
      });
    } else {
      mainWindow.webContents.send('microbitData', 'No micro:bit device found.');
      console.log('No micro:bit device found.');
    }
  });
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



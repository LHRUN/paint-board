import express from 'express'
import fileUpload from 'express-fileupload'
import path from 'path'
import cors from 'cors'
import fs from 'fs'
import iconv from 'iconv-lite';

const app = express();
app.use(cors())
app.use(fileUpload());

app.post('/upload', (req, res) => {
if (!req.files || Object.keys(req.files).length === 0) {
return res.status(400).send('No files were uploaded.');
}

const file = req.files.file;
console.log(req.files);
var destinationFile = "";
if(file.mimetype == 'image/png'){
  destinationFile = 'test.png';
  saveFileAsImage(file, destinationFile);
}else if(file.mimetype == "text/csv"){
  destinationFile = "test.csv";
  saveFileAsCsv(file, destinationFile);
}


// const data = new Uint8Array(Buffer.from('Hello Node.js'));
// writeFile('message.txt', data, (err) => {
//   if (err) throw err;
//   console.log('The file has been saved!');
// });
function saveFileAsCsv(fileData, filePath) {
  const fileBuffer = Buffer.from(fileData.data, 'binary');
  const utf8Data = iconv.decode(fileBuffer, 'utf-8');
  fs.writeFile(filePath, utf8Data, 'utf-8', (err) => {

  });
  // const fd = fs.readFileSync(filePath);
  // const utf8Data = iconv.decode(fd, 'utf-8');
  // fs.writeFileSync(filePath, utf8Data);
}

function saveFileAsImage(fileData, filePath) {
  const fileBuffer = Buffer.from(fileData.data, 'binary');
  fs.writeFileSync(filePath, fileBuffer);
}


// fs.writeFile(destinationFolder, file, (error) => {
// if (error) {
//     console.error('Failed to write file:', error);
// } else {
//     console.log('File written successfully!');
// }
// });
//   file.mv(path.join(destinationFolder, file.name), (error) => {
//     if (error) {
//       console.error('Failed to move file:', error);
//       return res.status(500).send('Internal Server Error');
//     }

//     res.send('File uploaded successfully!');
//   });
});

app.listen(9876, () => {
  console.log('Server is running on port 9876');
});
import express from 'express'
import fileUpload from 'express-fileupload'
import path from 'path'
import cors from 'cors'
import fs from 'fs'

const app = express();
app.use(cors())
app.use(fileUpload());

app.post('/upload', (req, res) => {
if (!req.files || Object.keys(req.files).length === 0) {
return res.status(400).send('No files were uploaded.');
}

const file = req.files.file;
var destinationFile = "";
if(file.mimetype == 'image/png'){
  destinationFile = 'test.png';
}else if(file.mimetype == "text/csv"){
  destinationFile = "test.csv";
}

function saveFileAsImage(fileData, filePath) {
  const fileBuffer = Buffer.from(fileData.data, 'binary');
  fs.writeFileSync(filePath, fileBuffer);
}
console.log(req.files);
saveFileAsImage(file, destinationFile);
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
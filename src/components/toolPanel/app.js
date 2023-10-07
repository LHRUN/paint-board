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
const destinationFolder = 'test.png';
console.log(file.toString());
fs.writeFile(destinationFolder, file, (error) => {
if (error) {
    console.error('Failed to write file:', error);
} else {
    console.log('File written successfully!');
}
});
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
// const multer  = require('multer')


// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "public");
//     },
//     filename: (req, file, cb) => {
//       const ext = file.mimetype.split("/")[1];
//       cb(null, `files/images-${file.fieldname}-${Date.now()}.${ext}`);
//     },
//   });
  
//   const upload=multer({storage:multerStorage})
// const fs = require('fs');
// const path = require('path');

// /**
//  * Quét folder modules và lấy danh sách các thư mục con (module)
//  * @param {string} modulesDir - đường dẫn tuyệt đối tới thư mục modules
//  * @returns {string[]} mảng tên thư mục con (module)
//  */
// function getModuleFolders(modulesDir) {
//     let data = {};
//   try {
//     const items = fs.readdirSync(modulesDir, { withFileTypes: true });
//     // Lọc chỉ lấy thư mục
//     const folders = items
//       .filter(item => item.isDirectory())
//       .map(dir => dir.name);
    
//     return folders;
//   } catch (err) {
//     console.error('Error reading modules directory:', err);
//     return [];
//   }
// }

// module.exports = { getModuleFolders };
const fs = require('fs');
const path = require('path');

/**
 * Quét folder modules, với mỗi module lấy dữ liệu languages
 * @param {string} modulesDir - đường dẫn tuyệt đối tới thư mục modules
 * @returns {object} object dạng { moduleName: { langKey: jsonData, ... }, ... }
 */
function getModulesLanguages(modulesDir) {
  const result = {};

  try {
    const modules = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(dir => dir.name);

    modules.forEach(moduleName => {
      const languagesDir = path.join(modulesDir, moduleName, 'languages');
      const langData = {};

      if (fs.existsSync(languagesDir) && fs.statSync(languagesDir).isDirectory()) {
        const files = fs.readdirSync(languagesDir, { withFileTypes: true })
          .filter(f => f.isFile() && f.name.endsWith('.json'))
          .map(f => f.name);

        files.forEach(filename => {
          const langKey = path.basename(filename, '.json');
          const filePath = path.join(languagesDir, filename);

          try {
            const content = fs.readFileSync(filePath, 'utf8');
            langData[langKey] = JSON.parse(content);
          } catch (e) {
            console.error(`Failed to read or parse ${filePath}:`, e);
          }
        });
      }

      result[moduleName] = langData;
    });

    // Trả về object, không stringify
    return result;

  } catch (err) {
    console.error('Error reading modules directory:', err);
    return {};
  }
}


module.exports = { getModulesLanguages };

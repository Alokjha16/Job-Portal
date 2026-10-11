const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

const readJson = async (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeJson = async (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const updateJson = async (filename, updateFn) => {
  const data = await readJson(filename);
  const updated = updateFn(data);
  await writeJson(filename, updated);
  return updated;
};

module.exports = { readJson, writeJson, updateJson };

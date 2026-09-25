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

const appendJson = async (filename, item) => {
  return await updateJson(filename, (data) => {
    data.push(item);
    return data;
  });
};

const findInJson = async (filename, predicate) => {
  const data = await readJson(filename);
  return data.find(predicate);
};

const filterJson = async (filename, predicate) => {
  const data = await readJson(filename);
  return data.filter(predicate);
};

const updateInJson = async (filename, predicate, updates) => {
  return await updateJson(filename, (data) => {
    const index = data.findIndex(predicate);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
    }
    return data;
  });
};

const deleteFromJson = async (filename, predicate) => {
  return await updateJson(filename, (data) => {
    return data.filter(item => !predicate(item));
  });
};

module.exports = {
  readJson,
  writeJson,
  updateJson,
  appendJson,
  findInJson,
  filterJson,
  updateInJson,
  deleteFromJson
};

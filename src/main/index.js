const klawSync = require('klaw-sync');
const fs = require('fs');
const { exec } = require('child_process');
const chalk = require('chalk');
const boxen = require('boxen');
const log = chalk.bold.hex('#ffffff');
const error = chalk.bold.hex('#ffffff');
const boxenOptionsLog = {
  padding: 2,
  margin: 2,
  borderColor: '#54c754',
  backgroundColor: '#54c754',
};
const boxenOptionsError = {
  padding: 2,
  margin: 2,
  borderColor: '#c75454',
  backgroundColor: '#c75454',
};
const handleExec = cmd =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
const renderMyLog = msg => boxen(log(msg), boxenOptionsLog);
const renderMyError = msg => boxen(error(msg), boxenOptionsError);
const getFiles = pathName => {
  const files = klawSync(pathName, { nodir: true })
    .map(item => item.path)
    .filter(path => path.split('/').slice(-1)[0][0] !== '.');
  return files;
};
const getFileName = file => {
  const start = file.lastIndexOf('/') + 1;
  const end = file.lastIndexOf('.');
  const fileName = file.substr(start, end - start);
  const ext = file.substr(end, file.length);
  return [fileName, ext];
};

const clean = async props => {
  const { directory } = props;
  const dir = directory || process.cwd();
  const files = getFiles(dir);
  await handleDeletingAndConverting(files);
};

const RAW_FORMAT = '.CR3';
const JPG_FORMAT = '.JPG';
const HEIC_FORMAT = '.HEIC';

const handleDeletingAndConverting = async files => {
  const cr3Hash = {};
  const jpgHash = {};
  const heicHash = {};

  for (const file of files) {
    const [fileName, ext] = getFileName(file);

    if (ext.toLowerCase() === RAW_FORMAT.toLowerCase()) {
      cr3Hash[fileName] = file;
    } else if (ext.toLowerCase() === JPG_FORMAT.toLowerCase()) {
      jpgHash[fileName] = file;
    } else if (ext.toLowerCase() === HEIC_FORMAT.toLowerCase()) {
      heicHash[fileName] = file;
    }
  }

  if (Object.keys(heicHash).length > 0) {
    console.log(renderMyLog('Nothing changed because it has heic file and it seems it has already been cleaned before!'));
    return { cr3Hash, jpgHash, heicHash };
  }

  for (const fileName in jpgHash) {
    if (!cr3Hash[fileName]) {
      try {
        await handleExec(`rm '${jpgHash[fileName]}'`);
      } catch (e) {
        console.log(renderMyError(e));
      }
      delete jpgHash[fileName];
    } else {
      heicHash[fileName] = jpgHash[fileName].replace(JPG_FORMAT, HEIC_FORMAT.toLocaleLowerCase());
      const quickActionName = 'convert2Heic';
      const command = `automator -i "${jpgHash[fileName]}" ~/Library/Services/"${quickActionName}".workflow`;
      try {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });
      } catch (e) {}
    }
  }

  console.log(renderMyLog('Synced Successfully!'));
  return { cr3Hash, jpgHash, heicHash };
};

module.exports = {
  clean,
  handleDeletingAndConverting,
};

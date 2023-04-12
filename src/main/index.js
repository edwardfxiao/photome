const klawSync = require('klaw-sync');
const fs = require('fs');
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
  console.log(renderMyLog('Syncing Successfully!'));
  console.log(fileNamesHash);
  // handle rename srt file
  await handleSubRenaming(renamedFiles, fileNamesHash);
  console.log(renderMyLog('Formatted Successfully!'));
};

const RAW_FORMAT = '.CR3';
const JPG_FORMAT = '.JPG';

const handleDeletingAndConverting = async files => {
  //get files with the extension .jpg and store it in a hash and get files with the extension .cr3 and store it in another hash
  //loop through the hash of .jpg files and check if the file name is in the hash of .cr3 files
  const cr3Hash = {};
  const jpgHash = {};
  for (const file of files) {
    const [fileName, ext] = getFileName(file);
    if (ext === RAW_FORMAT) {
      cr3Hash[fileName] = file;
    } else if (ext === JPG_FORMAT) {
      jpgHash[fileName] = file;
    }
  }
  //loop through the hash of .jpg files and check if the file name is in the hash of .cr3 files,
  //if not then delete the file
  for (const file of files) {
    const [fileName, ext] = getFileName(file);
    if (ext === JPG_FORMAT) {
      if (!cr3Hash[fileName]) {
        //delete the file using noejs js
        await handleExec(`rm '${file}'`);
        // fs.unlink(file, err => {
        //   if (err) {
        //     console.error(err);
        //     return;
        //   }
        //   console.log(`${file} was deleted`);
        // });
      } else {
        const quickActionName = 'convert2Heic';
        // Use the "automator" command to run the Quick Action on the file
        const command = `automator -i "${file}" ~/Library/Services/"${quickActionName}".workflow`;
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
  }
};

module.exports = {
  clean,
};

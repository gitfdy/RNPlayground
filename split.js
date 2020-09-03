// split.js
const DiffMatchPatch = require('diff-match-patch');
const fs = require('fs');

const dmp = new DiffMatchPatch();

fs.readFile(`${process.cwd()}/common.ios.jsbundle`, 'utf8', (e, data) => {
    let commonData = data;
    fs.readFile(`${process.cwd()}/business.ios.jsbundle`, 'utf8', (e, data) => {
        let businessData = data;
        const patch = dmp.patch_make(commonData, businessData); // 生成补丁
        const patchText = dmp.patch_toText(patch); // 生成补丁文本
        fs.writeFileSync(`${process.cwd()}/diff.ios.patch`, patchText);
    });
});


// 去重直播源
const fs = require('fs');

// 读取文件内容
const filePath = 'iptv-default.m3u';
const fileContent = fs.readFileSync(filePath, 'utf-8');

// 用于存储已处理的tvg-name
const seenTvgNames = new Set();
const outputLines = [];

// 分割文件内容为行
const lines = fileContent.split('\n');

// 正则表达式匹配tvg-name
const tvgNamePattern = /tvg-name\s*=\s*\"([^\"]+)\"/i;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(tvgNamePattern);
    if (match) {
        const tvgName = match[1];
        if (!seenTvgNames.has(tvgName)) {
            seenTvgNames.add(tvgName);
            outputLines.push(line);
            if (i + 1 < lines.length) {
                outputLines.push(lines[i + 1]);
            }
        }
        i++; // 跳过下一行
    } else {
        outputLines.push(line);
    }
}

// 写回文件
const outputFilePath = 'iptv-test.m3u';
fs.writeFileSync(outputFilePath, outputLines.join('\n'), 'utf-8');

console.log('处理完成');
// console.log(outputLines.join('\n'));
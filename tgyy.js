const fs = require('fs');

// 读取文件内容
const filePath = 'ipv4.m3u';
const m3uContent = fs.readFileSync(filePath, 'utf-8');

function consolidateM3UWithLogo(m3uContent) {
  const lines = m3uContent.split('\n').map(line => line.trim()).filter(line => line);
  const entries = [];
  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXTINF:')) {
          // Extract group-title and channel name from the #EXTINF line
          const match = lines[i].match(/group-title="([^"]+)",(.*)$/);
          const groupTitle = match ? match[1] : 'Unknown';
          const channelName = match && match[2] ? match[2] : 'Unknown';
          currentEntry = {groupTitle, channelName, urls: []};
          entries.push(currentEntry);
      } else if (currentEntry) {
          // Add URL to the current entry's URLs array
          currentEntry.urls.push(lines[i]);
          // Prepare for the next entry
          currentEntry = null;
      }
  }

  // Consolidate entries by channel name and group-title
  const consolidatedEntries = {};
  entries.forEach(entry => {
      const key = `${entry.groupTitle}-${entry.channelName}`;
      if (!consolidatedEntries[key]) {
          consolidatedEntries[key] = entry;
      } else {
          // Append URLs to existing entry
          consolidatedEntries[key].urls = consolidatedEntries[key].urls.concat(entry.urls);
      }
  });

  // Rebuild the M3U content string with tvg-logo, tvg-id, and tvg-name
  let result = '#EXTM3U\n';
  Object.values(consolidatedEntries).forEach(entry => {
      const logoUrl = `https://epg.v1.mk/logo/${encodeURIComponent(entry.channelName)}.png`;
      const tvgId = encodeURIComponent(entry.channelName);
      const tvgName = entry.channelName;
      result += `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${logoUrl}" group-title="${entry.groupTitle}",${entry.channelName}\n`;
      entry.urls.forEach(url => result += `${url}\n`);
  });

  return result;
}

const processedContent = consolidateM3UWithLogo(m3uContent);

fs.writeFileSync('tgyy.m3u',processedContent, 'utf-8');

console.log('处理完成');
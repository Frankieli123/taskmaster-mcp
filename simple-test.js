import fs from 'fs';

const configContent = fs.readFileSync('./scripts/modules/config-manager.js', 'utf8');

console.log('检查polo配置:');
console.log('包含 "polo: \'POLO_API_KEY\'":', configContent.includes('polo: \'POLO_API_KEY\''));
console.log('包含 "getPoloBaseURL":', configContent.includes('getPoloBaseURL'));
console.log('包含 "poloBaseURL":', configContent.includes('poloBaseURL'));

// 查找polo相关的行
const lines = configContent.split('\n');
const poloLines = lines.filter(line => line.toLowerCase().includes('polo'));
console.log('\n找到的polo相关行:');
poloLines.forEach((line, index) => {
    console.log(`${index + 1}: "${line.trim()}"`);
});

// 检查具体的字符串
console.log('\n检查具体字符串:');
console.log('polo: \'POLO_API_KEY\':', configContent.includes('polo: \'POLO_API_KEY\''));
console.log('polo: "POLO_API_KEY":', configContent.includes('polo: "POLO_API_KEY"'));
console.log('polo: `POLO_API_KEY`:', configContent.includes('polo: `POLO_API_KEY`'));

// 查找keyMap部分
const keyMapMatch = configContent.match(/const keyMap = \{[\s\S]*?\};/);
if (keyMapMatch) {
    console.log('\nkeyMap部分:');
    console.log(keyMapMatch[0]);
}

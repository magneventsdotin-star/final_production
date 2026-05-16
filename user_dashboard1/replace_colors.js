const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'hello121-main/app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.css') || file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(dir);

let changes = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/#111111/gi, '#313131');
    content = content.replace(/#0c0b0a/gi, '#313131'); // tokens.css light theme bg
    
    // Yellows
    // Replace the main brand gold with Yellow
    content = content.replace(/#f6b64e/gi, '#FFE032');
    content = content.replace(/#ffce7b/gi, '#FFE032'); // brand-gold-lt
    content = content.replace(/#ffb347/gi, '#FFE032');
    content = content.replace(/#FF9933/gi, '#FFE032'); // index.css saffron
    content = content.replace(/#FFB366/gi, '#FFE032'); // index.css saffron-light
    
    // Replace the secondary/dark gold with Button Yellow
    content = content.replace(/#d99a3a/gi, '#EECE3B');
    content = content.replace(/#e67e22/gi, '#EECE3B');
    content = content.replace(/#ffcc33/gi, '#EECE3B');
    
    // Reds
    content = content.replace(/#c02424/gi, '#D65050'); // brand-ruby
    content = content.replace(/#e02a2a/gi, '#D65050'); // brand-ruby-lt
    content = content.replace(/#8b0000/gi, '#D65050'); // brand-ruby-dk
    content = content.replace(/#E53E3E/gi, '#D65050'); // index.css mic pulse / rec-dot
    content = content.replace(/229,62,62/gi, '214,80,80'); // rgb for #E53E3E is 229,62,62 -> #D65050 is 214, 80, 80
    content = content.replace(/192,36,36/gi, '214,80,80'); // rgb for #c02424 is 192,36,36

    // Also update glows to match
    content = content.replace(/246,182,78/gi, '255,224,50'); // rgb for #f6b64e -> #FFE032 is 255, 224, 50
    content = content.replace(/249,115,22/gi, '238,206,59'); // rgb for #f97316 -> #EECE3B is 238, 206, 59

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changes++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Done! Modified ${changes} files.`);

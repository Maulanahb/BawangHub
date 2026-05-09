const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/views/pages/Profil.tsx',
  'src/views/pages/Dashboard.tsx',
  'src/views/pages/JadwalTanam.tsx',
  'src/views/pages/BukuTani.tsx',
  'src/views/pages/Kalkulator.tsx',
  'src/views/pages/Forum.tsx',
  'src/views/pages/ForumDetail.tsx',
  'src/views/pages/CuacaDetail.tsx',
  'src/views/pages/Statistik.tsx',
  'src/views/pages/Klinik.tsx'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace lib
    content = content.replace(/from "\.\.\/lib\/firebase"/g, 'from "../../models/lib/firebase"');
    // Replace services
    content = content.replace(/from "\.\.\/services\/gemini"/g, 'from "../../models/services/gemini"');
    // Replace types
    content = content.replace(/from "\.\.\/types\/forum"/g, 'from "../../models/types/forum"');
    
    fs.writeFileSync(file, content);
  }
});
console.log("Done");

// codegen.js — Generate the complete .ino file with custom vectors

const CHAR_COMMENTS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '(blank)','(blank)','/',
  'Ä','Ö','Ü',
  ',','-','.',
  '!','?','ß',"'",'&','+',':',';','"','#','(',')','=','@','*',
  '} smiley','~ smiley','$ heart'
];

function buildVectorArray(vectorData) {
  const lines = ['const uint8_t vector[63][14] = {'];
  lines.push('  /*');
  lines.push('    encoding works as follows:');
  lines.push('    ones     = y coordinate;');
  lines.push('    tens     = x coordinate;');
  lines.push('    hundreds = draw/don\'t draw ..');
  lines.push('    200      = end');
  lines.push('    222      = plot point');
  lines.push('    !! for some reason leading zeros cause problems !!');
  lines.push('  */');

  for (let i = 0; i < 63; i++) {
    const vec = vectorData[i] || Vectorizer.DEFAULT_VECTORS[i];
    const vals = vec.slice(0, 14).map(v => String(v).padStart(3)).join(', ');
    const comma = i < 62 ? ',' : '';
    lines.push(`  {${vals}}${comma} /*${CHAR_COMMENTS[i]}*/`);
  }
  lines.push('};');
  return lines.join('\n');
}

async function generateInoFile(vectorData) {
  // Load the template
  const resp = await fetch('assets/message_template.ino');
  if (!resp.ok) throw new Error('Could not load template file');
  const template = await resp.text();

  const arrayCode = buildVectorArray(vectorData);
  return template.replace('{{VECTOR_ARRAY}}', arrayCode);
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.CodeGen = { generateInoFile, downloadFile, buildVectorArray };

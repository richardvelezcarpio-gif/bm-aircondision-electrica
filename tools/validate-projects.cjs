#!/usr/bin/env node
// Dependency-free, read-only validation of the shared project catalog.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = {window:{}};
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); return ok; };
const bilingual = value => ['en','es'].every(key => typeof value?.[key] === 'string' && value[key].trim());
const validId = value => typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
try {
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/projects/projects-data.js'),'utf8'), context, {timeout:1000});
  const catalog = context.window.BM_PROJECTS;
  if (!catalog || catalog.version !== 2 || !Array.isArray(catalog.projects)) throw new Error('Expected version: 2 and projects: [].');
  const ids = new Set();
  const counts = {'air-conditioning':0, electrical:0};
  let featured = 0;
  for (const project of catalog.projects) {
    if (!project || typeof project !== 'object') {errors.push('Invalid project record.'); continue;}
    const name = project.id || '(missing project id)';
    check(validId(project.id) && !ids.has(project.id), `${name}: project id must be valid and unique.`);
    ids.add(project.id);
    const categoryOK = Object.hasOwn(counts,project.category);
    check(categoryOK, `${name}: invalid category.`);
    check(bilingual(project.title), `${name}: title needs en/es.`);
    if (project.description) check(bilingual(project.description),`${name}: description needs en/es.`);
    if (!check(Array.isArray(project.images) && project.images.length>0, `${name}: images must be a nonempty array.`)) continue;
    const photoIds = new Set(), paths = new Set();
    for (const photo of project.images) {
      if (!photo || typeof photo !== 'object') {errors.push(`${name}: invalid photo record.`);continue;}
      check(validId(photo.id) && !photoIds.has(photo.id), `${name}: invalid/duplicate photo id ${photo.id}.`);
      photoIds.add(photo.id);
      check(!paths.has(photo.src),`${name}: duplicate source ${photo.src}.`); paths.add(photo.src);
      check(bilingual(photo.alt), `${name}/${photo.id}: alt needs en/es.`);
      check(Number.isInteger(photo.width) && photo.width>0 && Number.isInteger(photo.height) && photo.height>0, `${name}/${photo.id}: use positive integer dimensions.`);
      for (const key of ['src','full']) {
        if (key === 'full' && !photo.full) continue;
        const src = photo[key];
        const allowed = categoryOK && typeof src === 'string' && new RegExp('^assets/projects/'+project.category+'/(?:[a-z0-9_-]+/)*[a-z0-9_-]+[.](jpe?g|png|webp|avif)$','i').test(src);
        if(check(allowed, `${name}/${photo.id}: invalid local ${key} path.`)) check(fs.existsSync(path.join(root,src)) && fs.statSync(path.join(root,src)).isFile(), `${name}/${photo.id}: file missing: ${src}`);
      }
      if(photo.featured === true) featured++;
      if(categoryOK) counts[project.category]++;
    }
    check(photoIds.has(project.cover), `${name}: cover must reference an image id.`);
  }
  if(errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
  else console.log(`Catalog OK: ${catalog.projects.length} projects; Air Conditioning ${counts['air-conditioning']} photos; Electrical ${counts.electrical} photos; ${featured} explicitly featured.`);
  if(featured>8) console.log('Only the first eight featured selections are highlighted. All photos remain in their projects.');
} catch(error) { console.error('Catalog error: '+error.message); process.exitCode=1; }

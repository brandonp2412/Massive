import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import simpleGit from 'simple-git';
import os from 'os';

execSync('npx tsc', { stdio: 'inherit' });

let build = readFileSync('android/app/build.gradle', 'utf8');

const codeMatch = build.match(/versionCode (\d+)/);
if (!codeMatch) throw new Error('versionCode not found in build.gradle');
const versionCode = parseInt(codeMatch[1], 10) + 1;
build = build.replace(/versionCode \d+/, `versionCode ${versionCode}`);

const nameMatch = build.match(/versionName "(\d+\.\d+)"/);
if (!nameMatch) throw new Error('versionName not found in build.gradle');
const versionParts = nameMatch[1].split('.');
versionParts[1] = (parseInt(versionParts[1], 10) + 1).toString();
const versionName = versionParts.join('.');
build = build.replace(/versionName "\d+\.\d+"/, `versionName "${versionName}"`);

writeFileSync('android/app/build.gradle', build);

let packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
packageJson.version = versionName;
writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

const git = simpleGit();
await git.add(['package.json', 'android/app/build.gradle']);
await git.log(['-1']).then(log => {
    const newTitle = `${log.latest.message} - ${versionName} 🚀`;
    console.log(newTitle);
    const message = [newTitle, log.latest.body].join('\n');
    return git.commit(message, [], ['--amend']);
}).then(() => {
    return git.addTag(versionCode.toString());
}).then(() => {
    return git.push('origin', 'HEAD', ['--tags', '--force']);
}).catch(err => {
    console.error('Error amending commit:', err);
});

process.chdir('android')
const isWindows = os.platform() === 'win32';
execSync(isWindows ? '.\\gradlew.bat bundleRelease -q' : './gradlew bundleRelease -q', { stdio: 'inherit' });
execSync('bundle install --quiet', { stdio: 'inherit' });
execSync('bundle exec fastlane supply --aab app/build/outputs/bundle/release/app-release.aab', { stdio: 'inherit' });
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import simpleGit from 'simple-git';
import os from 'os';

execSync('npx tsc', { stdio: 'inherit' });
process.chdir('android');

const buildFilePath = join(process.cwd(), 'app', 'build.gradle');
let buildFile = readFileSync(buildFilePath, 'utf8');

const versionCodeMatch = buildFile.match(/versionCode (\d+)/);
if (!versionCodeMatch) throw new Error('versionCode not found in build.gradle');
const versionCode = parseInt(versionCodeMatch[1], 10) + 1;
buildFile = buildFile.replace(/versionCode \d+/, `versionCode ${versionCode}`);

const versionNameMatch = buildFile.match(/versionName "(\d+\.\d+)"/);
if (!versionNameMatch) throw new Error('versionName not found in build.gradle');
const versionParts = versionNameMatch[1].split('.');
versionParts[1] = (parseInt(versionParts[1], 10) + 1).toString();
const versionName = versionParts.join('.');
buildFile = buildFile.replace(/versionName "\d+\.\d+"/, `versionName "${versionName}"`);

writeFileSync(buildFilePath, buildFile);

const packageJsonPath = join(process.cwd(), '..', 'package.json');
let packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
packageJson.version = versionName;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

const isWindows = os.platform() === 'win32';
execSync(isWindows ? '.\\gradlew.bat bundleRelease' : './gradlew bundleRelease', { stdio: 'inherit' });
execSync('bundle install', { stdio: 'inherit' });
execSync('bundle exec fastlane supply --aab app/build/outputs/bundle/release/app-release.aab', { stdio: 'inherit' });

const git = simpleGit();
git.log(['-1']).then(log => {
    const lastCommitMessage = log.latest.message;
    const newCommitMessage = lastCommitMessage + ` - ${versionName} 🚀`;
    return git.commit(newCommitMessage, [buildFilePath, packageJsonPath]);
}).then(() => git.addTag(versionCode.toString()))
    .then(() => git.push('origin', 'HEAD'))
    .then(() => git.pushTags('origin'));
import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import { readFileSync, readFile, writeFileSync, writeFile, promises as fsPromises, existsSync, mkdirSync, rmdir } from 'fs';

let appDataPath = process.env.APPDATA;
let workbenchCSS = path.join(appDataPath as string, '..\\Local\\Programs\\Microsoft VS Code\\resources\\app\\out\\vs\\workbench\\workbench.desktop.main.css');
let workbenchJS = path.join(appDataPath as string, '..\\Local\\Programs\\Microsoft VS Code\\resources\\app\\out\\vs\\workbench\\workbench.desktop.main.js');

interface FontSettings {
	currentFont: string;
	defaultFont: string;
}

// Define the folder and file path
const folderName = 'VSCodeUI';
const fileName = 'settings.json';
const documentsFolderPath = path.join(homedir(), 'Documents');
const extensionFolderPath = path.join(documentsFolderPath, folderName);
const filePath = path.join(extensionFolderPath, fileName);

// Ensure that the extension's folder exists
function ensureDirectoryExistence(dirPath: string): void {
	if (!existsSync(dirPath)) {
		console.log(`Creating directory: ${dirPath}`);
		mkdirSync(dirPath, { recursive: true });
	}
}

// Function to read JSON data
function readSettings(): FontSettings | null {
	try {
		ensureDirectoryExistence(extensionFolderPath);
		if (!existsSync(filePath)) {
			console.log(`File not found. A new file will be created: ${filePath}`);
			return null; // File doesn't exist yet
		}
		const rawData = readFileSync(filePath, 'utf8');
		return JSON.parse(rawData);
	} catch (error) {
		console.error('Error reading the JSON file:', error);
		return null;
	}
}

// Function to write JSON data
function writeSettings(settings: FontSettings): void {
	try {
		ensureDirectoryExistence(extensionFolderPath);
		const data = JSON.stringify(settings, null, 2);
		writeFileSync(filePath, data, 'utf8');
		console.log(`Settings saved successfully in ${filePath}`);
	} catch (error) {
		console.error('Error writing to the JSON file:', error);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscodeui" is now active!');

	let disposable = vscode.commands.registerCommand('extension.changeFont', () => {

		if (process.platform !== 'win32') {
			vscode.window.showInformationMessage('This extension only works on Windows');
			return;
		}

		let settings = readSettings();
		if (!settings) {
			console.log('Creating new settings since none were found.');
			settings = { currentFont: 'Segoe WPC', defaultFont: 'Segoe WPC' };
			writeSettings(settings);
		}

		vscode.window.showInputBox({
			prompt: 'Enter your font name',
			placeHolder: 'Font Name - e.g. SF Pro Display'
		}).then(async (userFont) => {

			if (!userFont) {
				return vscode.window.showInformationMessage('Enter Valid Font Name');
			}

			let isJSDefault = await checkIfContainsAsync(workbenchJS, settings?.defaultFont);
			let isCSSDefault = await checkIfContainsAsync(workbenchCSS, settings?.defaultFont);
			let isJSCurrent = await checkIfContainsAsync(workbenchJS, settings?.currentFont);
			let isCSSCurrent = await checkIfContainsAsync(workbenchCSS, settings?.currentFont);

			if (!isJSDefault || !isCSSDefault) {
				if (!isJSCurrent || !isCSSCurrent) {
					return vscode.window.showInformationMessage('Default Font Not Found in Workbench Files, Reinistall VS Code');
				}
			}

			try {
				updateFile(workbenchJS, settings?.currentFont, userFont);
				updateFile(workbenchCSS, settings?.currentFont, userFont);
			} catch (error) {
				console.error(error);
				return vscode.window.showInformationMessage('An error occured, please try again');
			}

			vscode.window.showInformationMessage('Restart VS Code to see the changes', 'Reload').then(selection => {
				if (selection === 'Reload') {
					vscode.commands.executeCommand('workbench.action.reloadWindow');
				}
			});

		});
	});

	context.subscriptions.push(disposable);
}

async function checkIfContainsAsync(filename: string, str: string | undefined) {
	try {
		const contents = await fsPromises.readFile(filename, 'utf-8');

		if (str !== undefined) {
			const result: boolean = contents.includes(str);
			console.log(result);
			return result;
		}
		return false;
	} catch (err) {
		console.log(err);
	}
}

function updateFile(filePath: string, oldText: any, newText: any) {
	readFile(filePath, 'utf8', (err: any, data: string | any) => {
		if (err) {
			console.error(err);
			throw err;
		}

		let updatedData = data.replaceAll(
			oldText,
			newText
		);

		writeFile(filePath, updatedData, 'utf8', (err: any) => {
			if (err) {
				throw err;
			} else {
				console.log('File updated successfully');
				let settings = readSettings();
				settings = { currentFont: newText, defaultFont: settings!.defaultFont };
				writeSettings(settings);
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('Deactivating extension');
	vscode.window.showInformationMessage('Reinstall VS Code to get default fonts back');
}

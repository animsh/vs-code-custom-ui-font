import * as vscode from 'vscode';
const path = require('path');
import { readFile, writeFile, promises as fsPromises } from 'fs';

let extensionContext: vscode.ExtensionContext;
let workbenchCSS = path.join(process.env.APPDATA, '..\\Local\\Programs\\Microsoft VS Code\\resources\\app\\out\\vs\\workbench\\workbench.desktop.main.css');
let workbenchJS = path.join(process.env.APPDATA, '..\\Local\\Programs\\Microsoft VS Code\\resources\\app\\out\\vs\\workbench\\workbench.desktop.main.js');


export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;

	console.log('Congratulations, your extension "vscodeui" is now active!');

	const previousVersion = context.globalState.get('vscodeVersion');
	const currentVersion = vscode.version;

	if (previousVersion !== currentVersion) {
		console.log('VS Code was updated.');
		extensionContext.globalState.update('oldCSS', undefined);
		extensionContext.globalState.update('oldJS', undefined);
	}

	context.globalState.update('vscodeVersion', currentVersion);


	let disposable = vscode.commands.registerCommand('extension.changeFont', () => {

		if (process.platform !== 'win32') {
			vscode.window.showInformationMessage('This extension only works on Windows');
			return;
		}

		let oldCSS: (string | undefined) = context.globalState.get('oldCSS');
		let oldJS: (string | undefined) = context.globalState.get('oldJS');

		console.log(oldCSS);
		console.log(oldJS);

		vscode.window.showInputBox({
			prompt: 'Enter your font name',
			placeHolder: 'Font Name - e.g. SF Pro Display'
		}).then(async (userFont) => {

			if (!oldCSS) {
				context.globalState.update('oldCSS', 'Segoe WPC,Segoe UI');
				context.globalState.update('defaultCSS', 'Segoe WPC,Segoe UI');
				oldCSS = context.globalState.get('oldCSS');
			}

			if (!oldJS) {
				context.globalState.update('oldJS', '"Segoe WPC", "Segoe UI"');
				context.globalState.update('defaultJS', '"Segoe WPC", "Segoe UI"');
				oldJS = context.globalState.get('oldJS');
			}

			let isJS = await checkIfContainsAsync(workbenchJS, oldJS);
			let isCSS = await checkIfContainsAsync(workbenchCSS, oldCSS);

			if (!isJS) {
				context.globalState.update('oldJS', '"Segoe WPC", "Segoe UI"');
				context.globalState.update('defaultJS', '"Segoe WPC", "Segoe UI"');
				oldJS = context.globalState.get('oldJS');
				isJS = true;
			}

			if (!isCSS) {
				context.globalState.update('oldCSS', 'Segoe WPC,Segoe UI');
				context.globalState.update('defaultCSS', 'Segoe WPC,Segoe UI');
				oldCSS = context.globalState.get('oldCSS');
				isCSS = true;
			}

			if (isJS && isCSS) {
				let newCSS = `${userFont},Segoe WPC,Segoe UI`;
				let newJS = `${userFont}, "Segoe WPC", "Segoe UI"`;

				updateFile(workbenchCSS, oldCSS, newCSS, context, 'oldCSS');

				updateFile(workbenchJS, oldJS, newJS, context, 'oldJS');

				vscode.window.showInformationMessage('Restart VS Code to see the changes', 'Reload').then(selection => {
					if (selection === 'Reload') {
						vscode.commands.executeCommand('workbench.action.reloadWindow');
					}
				});
			}
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

function updateFile(filePath: string, oldText: any, newText: any, context: vscode.ExtensionContext, type: string) {
	readFile(filePath, 'utf8', (err: any, data: string | any) => {
		if (err) {
			console.error(err);
			return;
		}

		let updatedData = data.replaceAll(
			oldText,
			newText
		);

		writeFile(filePath, updatedData, 'utf8', (err: any) => {
			if (err) {
				console.error(err);
			} else {
				console.log('File updated successfully');
				context.globalState.update(type, newText);
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (process.platform !== 'win32') {
		vscode.window.showInformationMessage('This extension only works on Windows');
		return;
	}

	let oldCSS = extensionContext.globalState.get('oldCSS');
	let oldJS = extensionContext.globalState.get('oldJS');

	let defaultCSS = extensionContext.globalState.get('defaultCSS');
	let defaultJS = extensionContext.globalState.get('defaultJS');

	updateFile(workbenchCSS, oldCSS, defaultCSS, extensionContext, 'oldCSS');

	updateFile(workbenchJS, oldJS, defaultJS, extensionContext, 'oldJS');

	extensionContext.globalState.update('oldCSS', undefined);
	extensionContext.globalState.update('oldJS', undefined);
}

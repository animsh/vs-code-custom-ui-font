import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

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

		let oldCSS = context.globalState.get('oldCSS');
		let oldJS = context.globalState.get('oldJS');

		vscode.window.showInputBox({
			prompt: 'Enter your font name',
			placeHolder: 'Font Name - e.g. SF Pro Display'
		}).then((userFont) => {

			if (!oldCSS) {
				context.globalState.update('oldCSS', '.windows{font-family:Segoe WPC,Segoe UI,sans-serif}');
				context.globalState.update('defaultCSS', '.windows{font-family:Segoe WPC,Segoe UI,sans-serif}');
				oldCSS = context.globalState.get('oldCSS');
			}

			if (!oldJS) {
				context.globalState.update('oldJS', ':host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }');
				context.globalState.update('defaultJS', ':host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }');
				oldJS = context.globalState.get('oldJS');
			}

			let newCSS = '.windows {font-family: ' + userFont + ', Segoe WPC, Segoe UI, sans-serif;text-rendering: optimizeLegibility;-webkit-font-smoothing: antialiased;	}';
			let newJS = ":host-context(.windows) { font-family: '" + userFont + "', 'Segoe WPC', 'Segoe UI', sans-serif;}";

			updateFile(workbenchCSS, oldCSS, newCSS, context, 'oldCSS');

			updateFile(workbenchJS, oldJS, newJS, context, 'oldJS');

			vscode.window.showInformationMessage('Restart VS Code to see the changes', 'Reload').then(selection => {
				if (selection === 'Reload') {
					vscode.commands.executeCommand('workbench.action.reloadWindow');
				}
			});
		});
	});

	context.subscriptions.push(disposable);
}

function updateFile(filePath: string, oldText: any, newText: any, context: vscode.ExtensionContext, type: string) {
	fs.readFile(filePath, 'utf8', (err: any, data: any) => {
		if (err) {
			console.error(err);
			return;
		}

		let updatedData = data.replace(
			oldText,
			newText
		);

		fs.writeFile(filePath, updatedData, 'utf8', (err: any) => {
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

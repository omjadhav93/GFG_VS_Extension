import * as vscode from 'vscode';
import { activeStartWork } from './active';

const owner = "microsoft";
const repo = "vscode-extension-samples";
const issueNumber = 1254;

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand("good-first-guide.initialize", async () => {
			await activeStartWork(context, owner, repo, issueNumber);
		})
	);
}

export function deactivate() { }

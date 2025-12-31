import * as vscode from 'vscode';
import { activeStartWork, stageChanges, unstageChanges } from './active';
import { askIssueLink } from './utils';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"good-first-guide.initialize",
			async () => {
				try {
					const { owner, repo, issueNumber } = await askIssueLink();
					await activeStartWork(context, owner, repo, issueNumber);
				} catch (err: any) {
					vscode.window.showErrorMessage(err.message);
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.window.registerUriHandler({
			async handleUri(uri) {
				const params = new URLSearchParams(uri.query);

				const owner = params.get("owner") || "";
				const repo = params.get("repo") || "";
				const issueNumber = Number(params.get("issue"));

				await activeStartWork(context, owner, repo, issueNumber);
			}
		})
	);

	// extension.ts
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"good-first-guide.stageChanges",
			async () => {
				const repoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
				if (!repoPath) {return;}

				await stageChanges(repoPath);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"good-first-guide.unstageChanges",
			async () => {
				const repoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
				if (!repoPath) {return;}

				await unstageChanges(repoPath);
			}
		)
	);

}

export function deactivate() { }

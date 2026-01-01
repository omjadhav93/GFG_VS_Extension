import * as vscode from 'vscode';
import { activeStartWork, commitChanges, revertChanges, stageChanges, unstageChanges } from './active';
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
				if (!repoPath) { return; }

				await stageChanges(repoPath);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"good-first-guide.unstageChanges",
			async () => {
				const repoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
				if (!repoPath) { return; }

				await unstageChanges(repoPath);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"good-first-guide.commitChanges",
			async () => {
				const repoPath =
					vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

				if (!repoPath) {
					vscode.window.showErrorMessage("No workspace folder found.");
					return;
				}

				try {
					await commitChanges(repoPath);
				} catch (err: any) {
					vscode.window.showErrorMessage(err.message);
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"good-first-guide.revertChanges",
			async () => {
				const repoPath =
					vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

				if (!repoPath) {
					vscode.window.showErrorMessage("No workspace folder found.");
					return;
				}

				try {
					await revertChanges(repoPath);
				} catch (err: any) {
					vscode.window.showErrorMessage(err.message);
				}
			}
		)
	);

}

export function deactivate() { }

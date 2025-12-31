import * as vscode from 'vscode';
import { activeStartWork } from './active';
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
}

export function deactivate() { }
